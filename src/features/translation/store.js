// Translation domain store - manages AI translation and progress tracking
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { translationService } from '../../shared/services/translationService.js';

export const useTranslationStore = defineStore('translation', () => {
  // State
  const translationState = ref({
    currentChapterId: null,
    isTranslating: false,
    translationProgress: 0,
  });

  // Track ongoing translations to avoid duplicates
  const ongoingTranslations = new Set();

  // Getters
  const isTranslating = computed(() => translationState.value.isTranslating);
  const translationProgress = computed(() => translationState.value.translationProgress);

  // Actions
  const translateParagraph = async (originalText, glossaryContext) => {
    const translationKey = `${originalText}:${JSON.stringify(glossaryContext)}`;
    
    if (ongoingTranslations.has(translationKey)) {
      console.log('Translation already in progress, skipping duplicate');
      return 'Translation in progress...';
    }

    ongoingTranslations.add(translationKey);
    translationState.value.isTranslating = true;
    
    try {
      const result = await translationService.translateText(originalText, glossaryContext);
      return result || '';
    } catch (error) {
      console.error('Translation failed:', error);
      return 'Translation failed - please try again';
    } finally {
      ongoingTranslations.delete(translationKey);
      translationState.value.isTranslating = false;
    }
  };

  const retranslateParagraph = async (originalText, currentTranslation, glossaryTerms) => {
    const retranslationKey = `retranslate:${originalText}:${currentTranslation}:${JSON.stringify(glossaryTerms)}`;
    
    if (ongoingTranslations.has(retranslationKey)) {
      console.log('Retranslation already in progress, skipping duplicate');
      return currentTranslation;
    }

    ongoingTranslations.add(retranslationKey);
    translationState.value.isTranslating = true;
    
    try {
      const result = await translationService.retranslateWithGlossary(
        originalText, 
        currentTranslation, 
        glossaryTerms
      );
      return result || currentTranslation;
    } catch (error) {
      console.error('Retranslation failed:', error);
      return currentTranslation;
    } finally {
      ongoingTranslations.delete(retranslationKey);
      translationState.value.isTranslating = false;
    }
  };

  const translateChapter = async (paragraphs, glossaryContext) => {
    const chapterKey = `chapter:${JSON.stringify(paragraphs)}:${JSON.stringify(glossaryContext)}`;
    if (ongoingTranslations.has(chapterKey)) {
      console.log('Chapter translation already in progress');
      return paragraphs.map(() => 'Translation in progress...');
    }

    ongoingTranslations.add(chapterKey);
    translationState.value.isTranslating = true;
    translationState.value.translationProgress = 0;
    
    const translations = [];
    
    try {
      const batchSize = 3;
      
      for (let i = 0; i < paragraphs.length; i += batchSize) {
        const batch = paragraphs.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (paragraph) => {
          try {
            return await translationService.translateText(paragraph, glossaryContext);
          } catch (error) {
            console.error('Translation failed for paragraph:', error);
            return 'Translation failed';
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        translations.push(...batchResults);
        
        translationState.value.translationProgress = (Math.min(i + batchSize, paragraphs.length) / paragraphs.length) * 100;
      }
    } finally {
      ongoingTranslations.delete(chapterKey);
      translationState.value.isTranslating = false;
      translationState.value.translationProgress = 0;
    }
    
    return translations;
  };

  const clearOngoingTranslations = () => {
    ongoingTranslations.clear();
  };

  return {
    // State
    translationState: computed(() => translationState.value),
    isTranslating,
    translationProgress,
    
    // Actions
    translateParagraph,
    retranslateParagraph,
    translateChapter,
    clearOngoingTranslations,
  };
});

export default useTranslationStore;