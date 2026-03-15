/**
 * Translation Module - Pinia Store
 *
 * Manages translation operations with support for paragraph and chapter-level translation.
 * Features include: request deduplication, progress polling, job status tracking,
 * automatic billing feature checks, and smart glossary term suggestions.
 * Integrates with translation API layer with automatic mock/real switching.
 *
 * Usage Example:
 * ```typescript
 * import { useTranslationStore } from '@/modules/translation';
 *
 * const translation = useTranslationStore();
 *
 * // Translate an entire chapter (starts automatic polling)
 * const job = await translation.translateChapter('chapter-id');
 *
 * // Monitor progress
 * watch(() => translation.translationProgress, (progress) => {
 *   console.log(`Progress: ${progress}%`);
 * });
 *
 * // Stop ongoing translations
 * translation.clearOngoingTranslations();
 * ```
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { translationAPI } from './api';
import { useBillingStore } from '@/modules/billing';
import type { TranslationState, TranslationJobResponse } from './types';

export const useTranslationStore = defineStore('translation', () => {
  // State
  const translationState = ref<TranslationState>({
    currentChapterId: null,
    isTranslating: false,
    translationProgress: 0,
  });

  const ongoingTranslations = new Set<string>();
  
  // Add polling state
  const pollingInterval = ref<number | null>(null);
  const activeJobId = ref<string | null>(null);
  const currentJobData = ref<TranslationJobResponse | null>(null);

  // Getters
  const isTranslating = computed(() => translationState.value.isTranslating);
  const translationProgress = computed(() => translationState.value.translationProgress);
  const currentChapterId = computed(() => translationState.value.currentChapterId);

  // Actions
  function setTranslating(value: boolean) {
    translationState.value.isTranslating = value;
  }

  function setProgress(value: number) {
    translationState.value.translationProgress = Math.max(0, Math.min(100, value));
  }

  function setCurrentChapterId(chapterId: string | null) {
    translationState.value.currentChapterId = chapterId;
  }

  // Polling methods
  function startPolling(jobId: string) {
    stopPolling(); // Clear any existing polling
    
    activeJobId.value = jobId;
    currentJobData.value = null;
    
    // Set up interval FIRST to prevent race condition
    const intervalId = setInterval(() => {
      if (activeJobId.value) {
        pollJobStatus(activeJobId.value);
      }
    }, 1500);
    
    pollingInterval.value = intervalId;
    
    // Then poll immediately
    pollJobStatus(jobId);
  }

  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value);
      pollingInterval.value = null;
    }
    activeJobId.value = null;
    currentJobData.value = null;
  }

  async function pollJobStatus(jobId: string) {
    try {
      const response = await translationAPI.getTranslationJobStatus(jobId);
      
      if (response.success && response.data) {
        const jobData = response.data;
        currentJobData.value = jobData;
        setProgress(jobData.progress);
        
        // Update translation state based on job status
        if (jobData.status === 'processing' || jobData.status === 'pending') {
          setTranslating(true);
        } else if (jobData.status === 'completed' || jobData.status === 'failed') {
          setTranslating(false);
          
          // Stop polling interval but keep job data for components
          if (pollingInterval.value) {
            clearInterval(pollingInterval.value);
            pollingInterval.value = null;
          }
          activeJobId.value = null;
          
          // Clean up chapter translation from ongoing set
          const chapterKey = `chapter:${currentChapterId.value}`;
          ongoingTranslations.delete(chapterKey);
        }
      } else {
        console.warn('[Translation Store] Failed to poll job status:', response.error);
      }
    } catch (error) {
      console.error('[Translation Store] Error polling job status:', error);
    }
  }

  async function translateChapter(
    chapterId: string
  ): Promise<{ jobId: string } | null> {
    // Check feature access
    const billingStore = useBillingStore();
    if (!billingStore.hasFeature('translation')) {
      throw new Error('Translation feature requires a paid plan. Please upgrade.');
    }
    
    const chapterKey = `chapter:${chapterId}`;

    if (ongoingTranslations.has(chapterKey)) {
      console.log('[Translation Store] Chapter translation already in progress');
      return null;
    }

    ongoingTranslations.add(chapterKey);
    setTranslating(true);
    setCurrentChapterId(chapterId);
    setProgress(0);
    stopPolling(); // Clear any existing polling

    try {
      const response = await translationAPI.translateChapter(chapterId);
      
      if (!response.success || !response.data) {
        console.error('[Translation Store] Failed to start chapter translation:', response.error);
        ongoingTranslations.delete(chapterKey);
        setTranslating(false);
        setProgress(0);
        setCurrentChapterId(null);
        return null;
      }
      
      const jobId = response.data.jobId;
      
      // Start polling for this job
      startPolling(jobId);
      
      return { jobId };
    } catch (error) {
      console.error('[Translation Store] Chapter translation error:', error);
      ongoingTranslations.delete(chapterKey);
      setTranslating(false);
      setProgress(0);
      setCurrentChapterId(null);
      stopPolling();
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
    setCurrentChapterId(null);
    stopPolling();
  }

  return {
    // State
    translationState,
    
    // Getters
    isTranslating,
    translationProgress,
    currentChapterId,
    currentJobData: computed(() => currentJobData.value),
    
    // Actions
    setCurrentChapterId,
    translateChapter,
    suggestGlossaryTerms,
    clearOngoingTranslations,
    
    // Polling action
    stopPolling,
  };
});
