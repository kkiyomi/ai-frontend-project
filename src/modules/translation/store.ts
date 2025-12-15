/**
 * Translation Module - Store
 *
 * Reactive state management for translation operations.
 * Uses the Translation API layer which handles mock/real switching internally.
 *
 * Features:
 * - Translation state tracking (isTranslating, progress)
 * - Deduplication of concurrent translation requests
 * - Batch translation with progress tracking
 * - Single paragraph and retranslation support
 */

import { ref, computed } from 'vue';
import { translationAPI } from './api';
import type { TranslationState } from './types';

const translationState = ref<TranslationState>({
  currentChapterId: null,
  isTranslating: false,
  translationProgress: 0,
});

const ongoingTranslations = new Set<string>();

function setTranslating(value: boolean) {
  translationState.value.isTranslating = value;
}

function setProgress(value: number) {
  translationState.value.translationProgress = Math.max(0, Math.min(100, value));
}

function setCurrentChapterId(chapterId: string | null) {
  translationState.value.currentChapterId = chapterId;
}

async function translateParagraph(
  originalText: string,
  glossaryContext?: string[]
): Promise<string> {
  const translationKey = `${originalText}:${JSON.stringify(glossaryContext)}`;

  if (ongoingTranslations.has(translationKey)) {
    console.log('[Translation Store] Translation already in progress, skipping duplicate');
    return 'Translation in progress...';
  }

  ongoingTranslations.add(translationKey);
  setTranslating(true);

  try {
    const response = await translationAPI.translateText(originalText, glossaryContext);
    if (!response.success) {
      console.error('[Translation Store] Translation failed:', response.error);
      return 'Translation failed - please try again';
    }
    return response.data || '';
  } catch (error) {
    console.error('[Translation Store] Translation error:', error);
    return 'Translation failed - please try again';
  } finally {
    ongoingTranslations.delete(translationKey);
    setTranslating(false);
  }
}

async function retranslateParagraph(
  originalText: string,
  currentTranslation: string,
  glossaryTerms: string[]
): Promise<string> {
  const retranslationKey = `retranslate:${originalText}:${currentTranslation}:${JSON.stringify(glossaryTerms)}`;

  if (ongoingTranslations.has(retranslationKey)) {
    console.log('[Translation Store] Retranslation already in progress, skipping duplicate');
    return currentTranslation;
  }

  ongoingTranslations.add(retranslationKey);
  setTranslating(true);

  try {
    const response = await translationAPI.retranslateWithGlossary(
      originalText,
      currentTranslation,
      glossaryTerms
    );
    if (!response.success) {
      console.error('[Translation Store] Retranslation failed:', response.error);
      return currentTranslation;
    }
    return response.data || currentTranslation;
  } catch (error) {
    console.error('[Translation Store] Retranslation error:', error);
    return currentTranslation;
  } finally {
    ongoingTranslations.delete(retranslationKey);
    setTranslating(false);
  }
}

async function translateChapter(
  chapterId: string
): Promise<{ jobId: string } | null> {
  const chapterKey = `chapter:${chapterId}`;

  if (ongoingTranslations.has(chapterKey)) {
    console.log('[Translation Store] Chapter translation already in progress');
    return null;
  }

  ongoingTranslations.add(chapterKey);
  setTranslating(true);
  setCurrentChapterId(chapterId);
  setProgress(0);

  try {
    const response = await translationAPI.translateChapter(chapterId);
    
    if (!response.success) {
      console.error('[Translation Store] Failed to start chapter translation:', response.error);
      return null;
    }
    
    // Simulate progress updates (in real app, this would come from WebSocket/SSE/polling)
    // For now, we'll simulate progress
    const simulateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTranslating(false);
          setProgress(0);
          ongoingTranslations.delete(chapterKey);
          setCurrentChapterId(null);
        }
      }, 500);
    };
    
    // Start progress simulation
    setTimeout(simulateProgress, 100);
    
    return response.data || null;
  } catch (error) {
    console.error('[Translation Store] Chapter translation error:', error);
    ongoingTranslations.delete(chapterKey);
    setTranslating(false);
    setProgress(0);
    setCurrentChapterId(null);
    return null;
  }
}

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

function clearOngoingTranslations() {
  ongoingTranslations.clear();
  setTranslating(false);
  setProgress(0);
}

export function useTranslationStore() {
  return {
    translationState: computed(() => translationState.value),
    isTranslating: computed(() => translationState.value.isTranslating),
    translationProgress: computed(() => translationState.value.translationProgress),
    currentChapterId: computed(() => translationState.value.currentChapterId),
    setCurrentChapterId,
    translateParagraph,
    retranslateParagraph,
    translateChapter,
    suggestGlossaryTerms,
    clearOngoingTranslations,
  };
}
