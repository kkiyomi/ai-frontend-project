export interface ShareRequest {
  chapterIds: string[];
  seriesIds: string[];
  title?: string;
  description?: string;
  expirationDays?: number;
  password?: string;
}

export interface ShareResponse {
  shareId: string;
  shareUrl: string;
  expiresAt?: Date;
}

export interface SharedContent {
  id: string;
  title: string;
  description?: string;
  content: SharedChapter[];
  chapterIds?: string[];
  seriesIds?: string[];
  createdAt: Date;
  expiresAt?: Date;
  isPasswordProtected: boolean;
  password?: string;
  type?: 'series' | 'chapters';
}

export interface SharedChapter {
  id: string;
  title: string;
  originalText: string;
  translatedText: string;
  seriesName: string;
  seriesId: string;
}

export interface ShareStats {
  totalChapters: number;
  totalSeries: number;
  translatedParagraphs: number;
  totalParagraphs: number;
  translationProgress: number;
}
