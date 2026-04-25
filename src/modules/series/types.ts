export interface Series {
  id: string;
  name: string;
  description?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  createdAt: Date | string;
  chapterIds: string[];
}

export interface CreateSeriesRequest {
  name: string;
  description?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export interface UpdateSeriesRequest {
  name?: string;
  description?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export interface Language {
  code: string;
  name: string;
  isoCode?: string;
}

export interface SeriesState {
  series: Series[];
  selectedSeriesId: string | null;
  loading: boolean;
  error: string | null;
  languages: Language[];
}
