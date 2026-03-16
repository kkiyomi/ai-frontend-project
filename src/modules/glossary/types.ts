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

export interface GlossaryImportResponse {
  created_count: number;
  failed_count: number;
  failed: Array<{ row: number; error: string }>;
  terms: GlossaryTerm[];
}
