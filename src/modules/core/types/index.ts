// Core module types - shared across all modules
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Series {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  translatedContent: string;
  originalParagraphs: string[];
  translatedParagraphs: string[];
  seriesId: string;
  isTranslated?: boolean;
}

export interface TranslationState {
  currentChapterId: string | null;
  isTranslating: boolean;
  translationProgress: number;
}

// Re-export sharing types for backward compatibility
export type { ShareRequest, ShareResponse, SharedContent, SharedChapter, ShareStats } from './sharing';