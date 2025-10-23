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
