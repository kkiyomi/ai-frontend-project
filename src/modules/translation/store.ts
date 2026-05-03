/**
 * Translation Module - Pinia Store
 *
 * Manages translation operations with per-chapter state keyed by chapterId.
 * Features include: request deduplication, progress polling, job status tracking,
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
 * // Translate a chapter (per-chapter state tracks progress)
 * const job = await translation.translateChapter('chapter-id');
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
import type {
  TranslationState,
  ChapterTranslationState,
  TranslationJobResponse,
  StreamJobData,
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
   * Non-reactive storage for polling intervals — implementation detail,
   * never exposed to consumers or templates.
   */
  const pollingIntervals = new Map<string, ReturnType<typeof setInterval>>();

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
        jobData: null,
        streamJobData: null,
        streamingContent: '',
        jobId: null,
        activeStreamJobId: null,
      };
    }
    return chapterStates.value[chapterId];
  }

  /** Clean up polling and streaming resources for a chapter. */
  function _cleanupResources(chapterId: string) {
    // Clear polling interval
    const interval = pollingIntervals.get(chapterId);
    if (interval) {
      clearInterval(interval);
      pollingIntervals.delete(chapterId);
    }

    // Abort SSE stream
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

  /** Presentational polling job data for the current chapter. */
  const currentJobData = computed<TranslationJobResponse | null>(
    () => currentChapterId.value
      ? chapterStates.value[currentChapterId.value]?.jobData ?? null
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

  // ── Polling methods (per-chapter) ──────────────────────────────────────

  function startPolling(chapterId: string, jobId: string) {
    stopPolling(chapterId); // Clear any existing polling for this chapter

    const state = _getOrCreateState(chapterId);
    state.jobId = jobId;
    state.jobData = null;

    // Set up interval FIRST to prevent race condition
    const intervalId = setInterval(() => {
      pollJobStatus(chapterId, jobId);
    }, 2500);

    pollingIntervals.set(chapterId, intervalId);

    // Then poll immediately
    pollJobStatus(chapterId, jobId);
  }

  /**
   * Stop polling for a specific chapter.
   * When called without arguments clears ALL chapters' polling (backward compat).
   */
  function stopPolling(chapterId?: string) {
    if (chapterId) {
      const interval = pollingIntervals.get(chapterId);
      if (interval) {
        clearInterval(interval);
        pollingIntervals.delete(chapterId);
      }
      const state = _getState(chapterId);
      if (state) {
        state.jobId = null;
        state.jobData = null;
      }
    } else {
      // Legacy: stop ALL polling
      for (const [id, interval] of pollingIntervals) {
        clearInterval(interval);
        const state = chapterStates.value[id];
        if (state) {
          state.jobId = null;
          state.jobData = null;
        }
      }
      pollingIntervals.clear();
    }
  }

  async function pollJobStatus(chapterId: string, jobId: string) {
    try {
      const response = await translationAPI.getTranslationJobStatus(jobId);
      const state = _getState(chapterId);
      if (!state) return;

      if (response.success && response.data) {
        const jobData = response.data;
        state.jobData = jobData;
        state.translationProgress = Math.max(0, Math.min(100, jobData.progress));

        // Update isTranslating based on job status
        if (jobData.status === 'processing' || jobData.status === 'pending') {
          state.isTranslating = true;
        } else if (jobData.status === 'completed' || jobData.status === 'failed') {
          state.isTranslating = false;

          // Stop polling interval but keep job data for components
          const interval = pollingIntervals.get(chapterId);
          if (interval) {
            clearInterval(interval);
            pollingIntervals.delete(chapterId);
          }
          state.jobId = null;
        }
      } else {
        console.warn('[Translation Store] Failed to poll job status:', response.error);
      }
    } catch (error) {
      console.error('[Translation Store] Error polling job status:', error);
    }
  }

  /**
   * One-shot poll for the streaming fallback path.
   * Called when SSE closes with 0 events — checks the regular job status
   * endpoint to see if the job is already done.
   */
  async function pollJobStatusOnce(chapterId: string, jobId: string) {
    try {
      const response = await translationAPI.getTranslationJobStatus(jobId);
      const state = _getState(chapterId);
      if (!state) return;

      if (response.success && response.data) {
        const jobData = response.data;
        state.translationProgress = Math.max(0, Math.min(100, jobData.progress));

        if (jobData.status === 'completed') {
          console.log('[StreamTx] Fallback poll: job is completed');
          state.translationProgress = 100;
          state.streamJobData = { jobId, status: 'completed', progress: 100 };
        } else if (jobData.status === 'failed') {
          console.error('[StreamTx] Fallback poll: job failed:', jobData.errorMessage);
          state.streamJobData = {
            jobId,
            status: 'failed',
            progress: jobData.progress,
            errorMessage: jobData.errorMessage ?? 'Translation job failed',
          };
        } else {
          // Still in progress — start periodic polling
          console.log('[StreamTx] Fallback poll: job still %s, starting interval', jobData.status);
          startPolling(chapterId, jobId);
          return; // startPolling handles cleanup
        }
      }
    } catch (error) {
      console.error('[StreamTx] Fallback poll error:', error);
    }

    // If we reach here the job is terminal — do final cleanup
    const state = _getState(chapterId);
    if (state) {
      state.isTranslating = false;
    }
  }

  // ── Polling-based translation ───────────────────────────────────────────

  async function translateChapter(
    chapterId: string,
  ): Promise<{ jobId: string } | null> {
    // Check feature access
    const billingStore = useBillingStore();
    if (!billingStore.hasFeature('translation')) {
      throw new Error('Translation feature requires a paid plan. Please upgrade.');
    }

    const state = _getOrCreateState(chapterId);

    if (state.isTranslating) {
      console.log('[Translation Store] Chapter translation already in progress');
      return null;
    }

    setCurrentChapterId(chapterId);
    state.isTranslating = true;
    state.translationProgress = 0;
    _cleanupResources(chapterId);

    try {
      const response = await translationAPI.translateChapter(chapterId);

      if (!response.success || !response.data) {
        console.error('[Translation Store] Failed to start chapter translation:', response.error);
        state.isTranslating = false;
        state.translationProgress = 0;
        return null;
      }

      const jobId = response.data.jobId;

      // Start polling for this job
      startPolling(chapterId, jobId);

      return { jobId };
    } catch (error) {
      console.error('[Translation Store] Chapter translation error:', error);
      _deleteChapterState(chapterId);
      return null;
    }
  }

  // ── Streaming methods (per-chapter) ────────────────────────────────────

  /**
   * Abort the active SSE stream for a specific chapter.
   * When called without arguments aborts ALL streams (backward compat).
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
      // Legacy: abort ALL streams
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
  ): Promise<{ jobId: string } | null> {
    const billingStore = useBillingStore();
    if (!billingStore.hasFeature('translation')) {
      console.error('[StreamTx] Billing check failed — translation feature not available');
      throw new Error('Translation feature requires a paid plan. Please upgrade.');
    }

    const state = _getOrCreateState(chapterId);

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
      const response = await translationAPI.translateChapterStream(chapterId);

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

      // Track whether we received any actual SSE events —
      // if the stream closes with 0 events the SSE server had no
      // data to deliver (job already done, or no Pub/Sub messages).
      let sawEvent = false;

      const handle = connectSSE(
        streamUrl,
        {
          onConnected: () => {
            sawEvent = true;
            console.log('[StreamTx] connected event received');
          },
          onToken: (data) => {
            sawEvent = true;
            console.log('[StreamTx] onToken : ', data.token);
            const token = typeof data.token === 'string' ? data.token : '';
            if (token) {
              state.streamingContent += token;
            }
          },
          onChunkComplete: (data) => {
            sawEvent = true;
            console.log('[StreamTx] chunk_complete: seq=%s', data.chunk_sequence);
          },
          onProgress: (data) => {
            sawEvent = true;
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
            sawEvent = true;
            console.log('[StreamTx] completed event — translation done');
            state.translationProgress = 100;
            state.streamJobData = { jobId, status: 'completed', progress: 100 };
            handleCleanup();
          },

          onError: (data) => {
            sawEvent = true;
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
          },

          onClose: () => {
            const status = state.streamJobData?.status;
            const isTerminal = status === 'completed' || status === 'failed';
            const currentSawEvent = sawEvent;
            console.log('[StreamTx] SSE connection closed (sawEvent=%s, isTerminal=%s, status=%s)',
                        currentSawEvent, isTerminal, status);

            if ((!currentSawEvent || !isTerminal) && jobId) {
              // No events at all, or stream disconnected before terminal event
              // — fall back to polling the job status endpoint
              console.log('[StreamTx] %s — polling job status as fallback',
                          !currentSawEvent ? 'No SSE events received' : 'Stream closed without terminal event');
              pollJobStatusOnce(chapterId, jobId);
              // pollJobStatusOnce handles cleanup itself
            } else {
              // Terminal event was already handled via onCompleted/onError
              state.isTranslating = false;
            }
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

    // Getters (backward-compat — derive from current chapter)
    isTranslating,
    translationProgress,
    currentChapterId,
    currentJobData,
    streamJobData,
    streamingTranslatedContent,

    // Actions
    setCurrentChapterId,
    translateChapter,
    translateChapterStream,
    suggestGlossaryTerms,
    clearOngoingTranslations,
    stopPolling,   // kept for backward compat; delegates to per-chapter
    abortStream,   // kept for backward compat; delegates to per-chapter
  };
});
