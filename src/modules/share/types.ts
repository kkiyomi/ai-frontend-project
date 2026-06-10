export interface ShareLink {
  uuid: string;
  customName?: string;
  name?: string;
  publishType: 'chapter' | 'series';
  chapterId?: string;
  novelId?: string;
  includeGlossary: boolean;
  includeRaw: boolean;
  active: boolean;
  viewCount: number;
  createDate?: Date | string;
  chapterName?: string;
  novelName?: string;
}

export interface CreateShareLinkRequest {
  name?: string;
  customName?: string;
  publishType: 'chapter' | 'series';
  contentId: string;
  includeGlossary?: boolean;
  includeRaw?: boolean;
}

export interface SharedChapterData {
  title: string;
  seriesName: string;
  content: string;
  rawContent?: string;
  isPublished: boolean;
  glossary: GlossaryTermPublic[];
}

export interface SharedSeriesData {
  seriesName: string;
  seriesDescription?: string;
  chapters: SharedSeriesChapterItem[];
}

export interface SharedSeriesChapterItem {
  uuid: string;
  name: string;
  /** Owner-only: omitted from public API responses */
  sequence?: number;
  /** Owner-only: omitted from public API responses */
  hasPublishedContent?: boolean;
  /** Owner-only: omitted from public API responses */
  isPublished?: boolean;
}

export interface GlossaryTermPublic {
  term: string;
  translation: string;
  definition?: string;
}

export interface ShareState {
  /** Currently loaded shared chapter data */
  chapterData: SharedChapterData | null;
  /** Currently loaded shared series data */
  seriesData: SharedSeriesData | null;
  /** List of share links (translator view) */
  links: ShareLink[];
  loading: boolean;
  error: string | null;
}
