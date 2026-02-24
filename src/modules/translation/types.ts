/**
 * Translation Module - Types
 *
 * Domain types for the Translation module.
 */

export interface TranslationState {
  currentChapterId: string | null;
  isTranslating: boolean;
  translationProgress: number;
}

// Add these interfaces to the existing types

export interface TranslationJobResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalParagraphs?: number;
  processedParagraphs?: number;
  translatedParagraphs?: string[];
  errorMessage?: string;
}
