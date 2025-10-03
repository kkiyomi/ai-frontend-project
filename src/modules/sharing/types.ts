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
  chapterIds: string[];
  seriesIds: string[];
  createdAt: Date;
  expiresAt?: Date;
  isPasswordProtected: boolean;
  password?: string;
}

export interface ShareStats {
  totalChapters: number;
  totalSeries: number;
  translatedParagraphs: number;
  totalParagraphs: number;
  translationProgress: number;
}
