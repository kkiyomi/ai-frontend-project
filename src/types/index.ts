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
  paragraphs: Paragraph[];
  seriesId: string;
}

export interface Paragraph {
  id: string;
  originalText: string;
  translatedText: string;
  isEditing: boolean;
  chapterId: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  translation: string;
  category: 'character' | 'place' | 'cultural' | 'idiom' | 'other';
  frequency: number;
  isUserDefined: boolean;
  seriesId: string;
  chapterId?: string; // Optional - if null, it's a series-level term
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

// Re-export sharing types
export type { ShareRequest, ShareResponse, SharedContent, SharedChapter, ShareStats } from './sharing';