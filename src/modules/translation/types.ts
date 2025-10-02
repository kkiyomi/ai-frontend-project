/**
 * Translation Module - Types
 *
 * Domain types for the Translation module.
 */

export interface TranslationState {
  currentChapterId: string | null;
  isTranslating: boolean;
  translationProgress: number;
}

export interface TranslationRequest {
  text: string;
  glossaryContext?: string[];
}

export interface ParagraphTranslationRequest extends TranslationRequest {
  chapterId: string;
  paragraphIndex: number;
}

export interface RetranslationRequest {
  originalText: string;
  currentTranslation: string;
  glossaryTerms: string[];
}

export interface ChapterTranslationRequest {
  paragraphs: string[];
  glossaryContext?: string[];
  chapterId?: string;
}
