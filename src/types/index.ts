export interface Chapter {
  id: string;
  title: string;
  content: string;
  paragraphs: Paragraph[];
  originalFile?: File;
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