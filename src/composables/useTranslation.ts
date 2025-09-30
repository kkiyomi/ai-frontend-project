import { ref, computed } from 'vue';
import type { TranslationState, APIResponse } from '../types';
import { useAPI } from './useAPI';

const translationState = ref<TranslationState>({
  currentChapterId: null,
  isTranslating: false,
  translationProgress: 0,
});

// Track ongoing translations to avoid duplicates
const ongoingTranslations = new Set<string>();
export function useTranslation() {
  const { translateText, retranslateWithGlossary } = useAPI();

  const translateParagraph = async (
    originalText: string, 
    glossaryContext?: string[]
  ): Promise<string> => {
    // Create a unique key for this translation
    const translationKey = `${originalText}:${JSON.stringify(glossaryContext)}`;
    
    // Avoid duplicate translations
    if (ongoingTranslations.has(translationKey)) {
      console.log('Translation already in progress, skipping duplicate');
      return 'Translation in progress...';
    }

    ongoingTranslations.add(translationKey);
    translationState.value.isTranslating = true;
    
    try {
      const response = await translateText(originalText, glossaryContext);
      return response.data || '';
    } catch (error) {
      console.error('Translation failed:', error);
      return 'Translation failed - please try again';
    } finally {
      ongoingTranslations.delete(translationKey);
      translationState.value.isTranslating = false;
    }
  };

  const retranslateParagraph = async (
    originalText: string, 
    currentTranslation: string,
    glossaryTerms: string[]
  ): Promise<string> => {
    // Create a unique key for this retranslation
    const retranslationKey = `retranslate:${originalText}:${currentTranslation}:${JSON.stringify(glossaryTerms)}`;
    
    // Avoid duplicate retranslations
    if (ongoingTranslations.has(retranslationKey)) {
      console.log('Retranslation already in progress, skipping duplicate');
      return currentTranslation;
    }

    ongoingTranslations.add(retranslationKey);
    translationState.value.isTranslating = true;
    
    try {
      const response = await retranslateWithGlossary(
        originalText, 
        currentTranslation, 
        glossaryTerms
      );
      return response.data || currentTranslation;
    } catch (error) {
      console.error('Retranslation failed:', error);
      return currentTranslation;
    } finally {
      ongoingTranslations.delete(retranslationKey);
      translationState.value.isTranslating = false;
    }
  };

  const translateChapter = async (
    paragraphs: string[], 
    glossaryContext?: string[]
  ): Promise<string[]> => {
    // Avoid duplicate chapter translations
    const chapterKey = `chapter:${JSON.stringify(paragraphs)}:${JSON.stringify(glossaryContext)}`;
    if (ongoingTranslations.has(chapterKey)) {
      console.log('Chapter translation already in progress');
      return paragraphs.map(() => 'Translation in progress...');
    }

    ongoingTranslations.add(chapterKey);
    translationState.value.isTranslating = true;
    translationState.value.translationProgress = 0;
    
    const translations: string[] = [];
    
    try {
      // Process translations in batches for better performance
      const batchSize = 3; // Translate 3 paragraphs at once
      
      for (let i = 0; i < paragraphs.length; i += batchSize) {
        const batch = paragraphs.slice(i, i + batchSize);
        
        // Translate batch in parallel
        const batchPromises = batch.map(async (paragraph) => {
          try {
            const response = await translateText(paragraph, glossaryContext);
            return response.data || 'Translation failed';
          } catch (error) {
            console.error('Translation failed for paragraph:', error);
            return 'Translation failed';
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        translations.push(...batchResults);
        
        // Update progress
        translationState.value.translationProgress = (Math.min(i + batchSize, paragraphs.length) / paragraphs.length) * 100;
      }
    } finally {
      ongoingTranslations.delete(chapterKey);
      translationState.value.isTranslating = false;
      translationState.value.translationProgress = 0;
    }
    
    return translations;
  };

  // Clear ongoing translations (useful for cleanup)
  const clearOngoingTranslations = () => {
    ongoingTranslations.clear();
  };
  return {
    translationState: computed(() => translationState.value),
    isTranslating: computed(() => translationState.value.isTranslating),
    translationProgress: computed(() => translationState.value.translationProgress),
    translateParagraph,
    retranslateParagraph,
    translateChapter,
    clearOngoingTranslations,
  };
}