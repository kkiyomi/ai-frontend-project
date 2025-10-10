export interface Series {
  id: string;
  name: string;
  description?: string;
  createdAt: Date | string;
  chapterIds: string[];
}

export interface CreateSeriesRequest {
  name: string;
  description?: string;
}

export interface UpdateSeriesRequest {
  name?: string;
  description?: string;
}

export interface SeriesState {
  series: Series[];
  selectedSeriesId: string | null;
  loading: boolean;
  error: string | null;
}
