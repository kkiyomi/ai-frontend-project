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

export interface ChapterCreateInput {
  title: string;
  content: string;
  seriesId: string;
  translatedContent?: string;
}

export interface ChapterUpdateInput {
  title?: string;
  content?: string;
  translatedContent?: string;
  isTranslated?: boolean;
}
