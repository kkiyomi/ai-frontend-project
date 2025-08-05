import { ref, computed } from 'vue';
import type { TranslationState, APIResponse } from '../types';
import { useAPI } from './useAPI';

const translationState = ref<TranslationState>({
  currentChapterId: null,
  isTranslating: false,
  translationProgress: 0,
});

export function useTranslation() {
  const { translateText, retranslateWithGlossary } = useAPI();

  const translateParagraph = async (
    originalText: string, 
    glossaryContext?: string[]
  ): Promise<string> => {
    translationState.value.isTranslating = true;
    
    try {
      const response = await translateText(originalText, glossaryContext);
      return response.data || '';
    } catch (error) {
      console.error('Translation failed:', error);
      return 'Translation failed - please try again';
    } finally {
      translationState.value.isTranslating = false;
    }
  };

  const retranslateParagraph = async (
    originalText: string, 
    currentTranslation: string,
    glossaryTerms: string[]
  ): Promise<string> => {
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
      translationState.value.isTranslating = false;
    }
  };

  const translateChapter = async (
    paragraphs: string[], 
    glossaryContext?: string[]
  ): Promise<string[]> => {
    translationState.value.isTranslating = true;
    translationState.value.translationProgress = 0;
    
    const translations: string[] = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      try {
        const translation = await translateParagraph(paragraphs[i], glossaryContext);
        translations.push(translation);
        translationState.value.translationProgress = ((i + 1) / paragraphs.length) * 100;
      } catch (error) {
        translations.push('Translation failed');
      }
    }
    
    translationState.value.isTranslating = false;
    translationState.value.translationProgress = 0;
    
    return translations;
  };

  return {
    translationState: computed(() => translationState.value),
    isTranslating: computed(() => translationState.value.isTranslating),
    translationProgress: computed(() => translationState.value.translationProgress),
    translateParagraph,
    retranslateParagraph,
    translateChapter,
  };
}