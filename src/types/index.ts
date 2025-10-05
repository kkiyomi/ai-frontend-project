export interface Series {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  chapters: Chapter[];
  chapterIds?: string[];
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

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  translation: string;
  category: string;
  frequency: number;
  isUserDefined: boolean;
  seriesId: string;
  chapterId?: string; // Optional - if null, it's a series-level term
  chapterIds?: string[];
}

export interface TranslationState {
  currentChapterId: string | null;
  isTranslating: boolean;
  translationProgress: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Re-export sharing types from module
export type { ShareRequest, ShareResponse, SharedContent, ShareStats } from '@/modules/sharing';