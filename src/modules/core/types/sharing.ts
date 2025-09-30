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
  type: 'chapter' | 'chapters' | 'series' | 'multiple-series';
  title: string;
  description?: string;
  content: SharedChapter[];
  createdAt: Date;
  expiresAt?: Date;
  isPasswordProtected: boolean;
  password?: string; // Only stored in mock API for demo purposes
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