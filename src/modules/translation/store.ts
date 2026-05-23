/**
 * Translation Module - Pinia Store
 *
 * Manages translation operations with per-chapter state keyed by chapterId.
 * Features include: request deduplication, streaming progress tracking,
 * automatic billing feature checks, and smart glossary term suggestions.
 * Integrates with translation API layer with automatic mock/real switching.
 *
 * ── Architecture ──
 * All translation state lives in `chapterStates: Record<string, ChapterTranslationState>`
 * so each chapter has independent `isTranslating`, `translationProgress`, `streamingContent`,
 * etc.  A convenience `currentChapterId` ref tracks which chapter the UI is focused on,
 * and getters like `isTranslating` / `translationProgress` derive from that chapter's state.
 *
 * Usage Example:
 * ```typescript
 * import { useTranslationStore } from '@/modules/translation';
 *
 * const translation = useTranslationStore();
 *
 * // Translate a chapter via streaming (per-chapter state tracks progress)
 * const job = await translation.translateChapterStream('chapter-id');
 *
 * // Monitor progress for the current chapter
 * watch(() => translation.translationProgress, (progress) => {
 *   console.log(`Progress: ${progress}%`);
 * });
 * ```
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { translationAPI } from './api';
import { connectSSE, type SSEStreamHandle } from './sseClient';
import { useBillingStore } from '@/modules/billing';
import { useErrorStore } from '@/modules/core/stores/errorStore';
import type {
  TranslationState,
  ChapterTranslationState,
  StreamJobData,
  TranslationMode,
} from './types';

export const useTranslationStore = defineStore('translation', () => {
  // ── State ──────────────────────────────────────────────────────────────

  /** Which chapter the UI currently considers "active".  Set by navigation. */
  const currentChapterId = ref<string | null>(null);

  /**
   * Per-chapter translation state.
   * Each entry is independent so chapters don't clobber each other.
   */
  const chapterStates = ref<Record<string, ChapterTranslationState>>({});

  /**
   * Non-reactive storage for active SSE stream handles — implementation detail,
   * never exposed to consumers or templates.
   */
  const streamHandles = new Map<string, SSEStreamHandle>();

  // ── Helpers ────────────────────────────────────────────────────────────

  /** Get the state for a chapter, or undefined if none exists. */
  function _getState(chapterId: string): ChapterTranslationState | undefined {
    return chapterStates.value[chapterId];
  }

  /** Get the state for a chapter, creating a fresh default if missing. */
  function _getOrCreateState(chapterId: string): ChapterTranslationState {
    if (!chapterStates.value[chapterId]) {
      chapterStates.value[chapterId] = {
        isTranslating: false,
        translationProgress: 0,
        streamJobData: null,
        streamingContent: '',
        activeStreamJobId: null,
        mode: null,
        hasFreshExtraction: false,
      };
    }
    return chapterStates.value[chapterId];
  }

  /** Clean up streaming resources for a chapter. */
  function _cleanupResources(chapterId: string) {
    const handle = streamHandles.get(chapterId);
    if (handle) {
      handle.abort();
      streamHandles.delete(chapterId);
    }
  }

  /** Tear down everything for a chapter (resources + state entry). */
  function _deleteChapterState(chapterId: string) {
    _cleanupResources(chapterId);
    delete chapterStates.value[chapterId];
  }

  // ── Backward-compat Computed (derive from current chapter) ────────────

  /** @deprecated Prefer `getChapterState(id)` for chapter-specific reads. */
  const translationState = computed<TranslationState>(() => ({
    currentChapterId: currentChapterId.value,
    isTranslating: isTranslating.value,
    translationProgress: translationProgress.value,
  }));

  const isTranslating = computed(
    () => currentChapterId.value
      ? chapterStates.value[currentChapterId.value]?.isTranslating ?? false
      : false,
  );

  const translationProgress = computed(
    () => currentChapterId.value
      ? chapterStates.value[currentChapterId.value]?.translationProgress ?? 0
      : 0,
  );

  /** Presentational stream job data for the current chapter. */
  const streamJobData = computed<StreamJobData | null>(
    () => currentChapterId.value
      ? chapterStates.value[currentChapterId.value]?.streamJobData ?? null
      : null,
  );

  /**
   * Streaming content for ALL chapters as a `Record<chapterId, string>`.
   * Used by TranslationView to look up the current chapter's live tokens.
   */
  const streamingTranslatedContent = computed<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    for (const [id, state] of Object.entries(chapterStates.value)) {
      result[id] = state.streamingContent;
    }
    return result;
  });

  // ── Current-chapter setter ─────────────────────────────────────────────

  function setCurrentChapterId(chapterId: string | null) {
    currentChapterId.value = chapterId;
  }

  // ── Streaming methods (per-chapter) ────────────────────────────────────

  /**
   * Abort the active SSE stream for a specific chapter.
   * When called without arguments aborts ALL streams.
   */
  function abortStream(chapterId?: string) {
    if (chapterId) {
      const handle = streamHandles.get(chapterId);
      if (handle) {
        handle.abort();
        streamHandles.delete(chapterId);
      }
      const state = _getState(chapterId);
      if (state) {
        state.activeStreamJobId = null;
        state.streamJobData = null;
      }
    } else {
      // Abort ALL streams
      for (const [id, handle] of streamHandles) {
        handle.abort();
        const state = chapterStates.value[id];
        if (state) {
          state.activeStreamJobId = null;
          state.streamJobData = null;
        }
      }
      streamHandles.clear();
    }
  }

  /**
   * Translate a chapter via the streaming SSE endpoint.
   *
   * 1. POSTs to /translate-chapter-stream → gets { jobId, streamUrl }
   * 2. Opens an SSE connection to the streaming server
   * 3. Updates per-chapter progress reactively as events arrive
   * 4. Sets `streamJobData.status = 'completed'` / `'failed'` on terminal events
   *
   * Components can watch `streamJobData` to react to completion.
   *
   * ── Tracing logs ──────────────────────────────────────────────────────
   * Frontend: enable DEBUG=translation:* in browser console to see SSE events.
   * Backend:  docker compose logs -f ai-worker ai-stream
   */
  async function translateChapterStream(
    chapterId: string,
    mode: TranslationMode = 'full',
  ): Promise<{ jobId: string } | null> {
    const billingStore = useBillingStore();
    if (!billingStore.hasFeature('translation')) {
      console.error('[StreamTx] Billing check failed — translation feature not available');
      throw new Error('Translation feature requires a paid plan. Please upgrade.');
    }

    const state = _getOrCreateState(chapterId);
    state.mode = mode;

    if (state.isTranslating) {
      console.log('[StreamTx] Chapter %s streaming translation already in progress, skipping', chapterId);
      return null;
    }

    setCurrentChapterId(chapterId);
    state.isTranslating = true;
    state.translationProgress = 0;
    _cleanupResources(chapterId);

    console.log('[StreamTx] Requesting stream for chapter %s…', chapterId);

    try {
      const response = await translationAPI.translateChapterStream(chapterId, mode);

      if (!response.success || !response.data) {
        console.error('[StreamTx] POST /translate-chapter-stream failed:', response.error);
        state.isTranslating = false;
        state.translationProgress = 0;
        return null;
      }

      const { jobId, streamUrl, completed } = response.data;
      console.log('[StreamTx] POST OK — jobId=%s streamUrl=%s completed=%s', jobId, streamUrl, completed);

      // ── Chapter already done: skip SSE, mark completed immediately ──
      if (completed) {
        console.log('[StreamTx] Chapter already done — skipping SSE, marking completed');
        state.streamingContent = '';
        state.streamJobData = { jobId, status: 'completed', progress: 100 };
        state.translationProgress = 100;
        state.isTranslating = false;
        return { jobId };
      }

      // Initialise stream job data and reset live content for this chapter
      state.streamingContent = '';
      state.streamJobData = { jobId, status: 'processing', progress: 0 };
      state.activeStreamJobId = jobId;

      const handleCleanup = () => {
        state.isTranslating = false;
        state.activeStreamJobId = null;
        streamHandles.delete(chapterId);
      };

      console.log('[StreamTx] Opening SSE connection to %s …', streamUrl);

      const handle = connectSSE(
        streamUrl,
        {
          onConnected: () => {
            console.log('[StreamTx] connected event received');
          },
          onToken: (data) => {
            console.log('[StreamTx] onToken : ', data.token);
            const token = typeof data.token === 'string' ? data.token : '';
            if (token) {
              state.streamingContent += token;
            }
          },
          onChunkComplete: (data) => {
            console.log('[StreamTx] chunk_complete: seq=%s', data.chunk_sequence);
          },
          onProgress: (data) => {
            const pct = typeof data.progress === 'number'
              ? data.progress
              : state.translationProgress;
            console.log('[StreamTx] progress event → %d%% (message: %s)', pct, data.message ?? '');
            state.translationProgress = pct;
            if (state.streamJobData) {
              state.streamJobData.progress = pct;
            }
          },

          onCompleted: () => {
            console.log('[StreamTx] completed event — translation done');
            state.translationProgress = 100;
            state.streamJobData = { jobId, status: 'completed', progress: 100 };
            if (state.mode === 'extract_only') {
              state.hasFreshExtraction = true;
            }
            handleCleanup();
          },

          onError: (data) => {
            const errMsg = typeof data.error === 'string'
              ? data.error
              : 'Stream translation failed';
            console.error('[StreamTx] error event — %s', errMsg);
            state.streamJobData = {
              jobId: state.activeStreamJobId ?? jobId,
              status: 'failed',
              progress: state.translationProgress,
              errorMessage: errMsg,
            };
            handleCleanup();
            // Show error to the user
            useErrorStore().openErrorModal(errMsg, 'Translation job failed');
          },

          onClose: () => {
            console.log('[StreamTx] SSE connection closed, status=%s', state.streamJobData?.status);
            state.isTranslating = false;
            state.activeStreamJobId = null;
            streamHandles.delete(chapterId);
          },
        },
      );

      streamHandles.set(chapterId, handle);
      console.log('[StreamTx] SSE handle acquired, stream active=%s', handle.active);

      return { jobId };
    } catch (error) {
      console.error('[StreamTx] Unexpected error:', error);
      _deleteChapterState(chapterId);
      abortStream(chapterId);
      return null;
    }
  }

  // ── Mode convenience wrappers ────────────────────────────────────────────

  /**
   * Extract glossary terms only (no translation). After completion,
   * the user can review/edit terms in the glossary panel, then call
   * `translateWithReviewedTerms()` to translate using those terms.
   */
  async function extractGlossaryOnly(chapterId: string): Promise<{ jobId: string } | null> {
    return translateChapterStream(chapterId, 'extract_only');
  }

  /**
   * Translate a chapter using pre-existing glossary terms only,
   * skipping LLM re-extraction. Use after reviewing terms extracted
   * via `extractGlossaryOnly()`.
   */
  async function translateWithReviewedTerms(chapterId: string): Promise<{ jobId: string } | null> {
    return translateChapterStream(chapterId, 'translate_only');
  }

  // ── Glossary ────────────────────────────────────────────────────────────

  async function suggestGlossaryTerms(text: string): Promise<string[]> {
    try {
      const response = await translationAPI.suggestGlossaryTerms(text);
      if (!response.success) {
        console.error('[Translation Store] Glossary term suggestion failed:', response.error);
        return [];
      }
      return response.data || [];
    } catch (error) {
      console.error('[Translation Store] Glossary term suggestion error:', error);
      return [];
    }
  }

  // ── Bulk cleanup ────────────────────────────────────────────────────────

  function clearOngoingTranslations() {
    // Clean up resources for all chapters
    for (const chapterId of Object.keys(chapterStates.value)) {
      _cleanupResources(chapterId);
    }
    chapterStates.value = {};
    currentChapterId.value = null;
  }

  // ── Public API ──────────────────────────────────────────────────────────
  return {
    // State
    translationState,
    chapterStates,

    // Getters (derive from current chapter)
    isTranslating,
    translationProgress,
    currentChapterId,
    streamJobData,
    streamingTranslatedContent,

    // Convenience getters
    canTranslateWithReviewedTerms: (chapterId: string) => {
      const state = _getState(chapterId);
      return state?.hasFreshExtraction === true && !state?.isTranslating;
    },

    // Actions
    setCurrentChapterId,
    translateChapterStream,
    extractGlossaryOnly,
    translateWithReviewedTerms,
    suggestGlossaryTerms,
    clearOngoingTranslations,
    abortStream,
  };
});
