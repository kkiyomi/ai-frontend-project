// Translation service - handles AI translation logic
import { apiService } from './apiService.js';

class TranslationService {
  async translateText(text, glossaryContext) {
    const response = await apiService.translateText(text, glossaryContext);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Translation failed');
  }

  async translateParagraph(text, chapterId, paragraphIndex, glossaryContext) {
    const response = await apiService.translateParagraph(text, chapterId, paragraphIndex, glossaryContext);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Paragraph translation failed');
  }

  async retranslateWithGlossary(originalText, currentTranslation, glossaryTerms) {
    const response = await apiService.retranslateWithGlossary(originalText, currentTranslation, glossaryTerms);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Retranslation failed');
  }

  async suggestGlossaryTerms(text) {
    const response = await apiService.suggestGlossaryTerms(text);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to suggest glossary terms');
  }
}

export const translationService = new TranslationService();