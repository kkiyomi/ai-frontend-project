export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  translation: string;
  category: string;
  frequency: number;
  isUserDefined: boolean;
  seriesId: string;
  chapterId?: string;
  chapterIds?: string[];
}

export interface GlossaryHeader {
  type: 'header';
  id: string;
  category: string;
  count: number;
}

export interface GlossaryTermItem {
  type: 'term';
  id: string;
  term: string;
  definition: string;
  translation: string;
  category: string;
  frequency: number;
  isUserDefined: boolean;
  seriesId: string;
  chapterId?: string;
  chapterIds?: string[];
}

export type GlossaryItem = GlossaryHeader | GlossaryTermItem;

export interface GlossaryImportResponse {
  created_count: number;
  failed_count: number;
  failed: Array<{ row: number; error: string }>;
  terms: GlossaryTerm[];
}
