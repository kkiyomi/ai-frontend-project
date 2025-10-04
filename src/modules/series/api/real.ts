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
    const response = await apiClient.get<Series[]>('/series');

    if (response.success && response.data) {
      response.data = response.data.map(s => ({
        ...s,
        createdAt: new Date(s.createdAt)
      }));
    }

    return response;
  }

  async getSeriesById(seriesId: string): Promise<APIResponse<Series>> {
    const response = await apiClient.get<Series>(`/series/${seriesId}`);

    if (response.success && response.data) {
      response.data.createdAt = new Date(response.data.createdAt);
    }

    return response;
  }

  async createSeries(request: CreateSeriesRequest): Promise<APIResponse<Series>> {
    const response = await apiClient.post<Series>('/series', request);

    if (response.success && response.data) {
      response.data.createdAt = new Date(response.data.createdAt);
    }

    return response;
  }

  async updateSeries(seriesId: string, request: UpdateSeriesRequest): Promise<APIResponse<Series>> {
    const response = await apiClient.patch<Series>(`/series/${seriesId}`, request);

    if (response.success && response.data) {
      response.data.createdAt = new Date(response.data.createdAt);
    }

    return response;
  }

  async deleteSeries(seriesId: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`/series/${seriesId}`);
  }
}
