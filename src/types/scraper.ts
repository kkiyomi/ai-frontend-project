export interface ScrapingResult {
  title: string;
  content: string;
  preview: string;
  paragraphCount: number;
  wordCount: number;
  success: boolean;
  error?: string;
}

export interface ScrapingOptions {
  titleSelector?: string;
  contentSelector?: string;
  removeSelectors?: string[];
  timeout?: number;
  userAgent?: string;
}

export interface ScrapingState {
  isLoading: boolean;
  result: ScrapingResult | null;
  error: string | null;
}
