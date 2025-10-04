/**
 * Series Module - Real API Implementation
 *
 * This file defines the real HTTP endpoints for series CRUD operations.
 * Uses Core's generic APIClient for HTTP communication.
 *
 * IMPORTANT: This is feature-specific API logic. Core module does NOT know about
 * series endpoints - each feature module owns its own API definitions.
 */

import { apiClient, type APIResponse } from '@/modules/core';
import type { Series, CreateSeriesRequest, UpdateSeriesRequest } from '../types';

export class SeriesRealAPI {
  async getSeries(): Promise<APIResponse<Series[]>> {
    return apiClient.get<Series[]>('/series');
  }

  async getSeriesById(seriesId: string): Promise<APIResponse<Series>> {
    return apiClient.get<Series>(`/series/${seriesId}`);
  }

  async createSeries(request: CreateSeriesRequest): Promise<APIResponse<Series>> {
    return apiClient.post<Series>('/series', request);
  }

  async updateSeries(seriesId: string, request: UpdateSeriesRequest): Promise<APIResponse<Series>> {
    return apiClient.patch<Series>(`/series/${seriesId}`, request);
  }

  async deleteSeries(seriesId: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`/series/${seriesId}`);
  }
}
