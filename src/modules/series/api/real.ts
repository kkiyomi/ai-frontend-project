import { APIClient } from '@/modules/core/services/apiClient';
import type { APIResponse } from '@/modules/core/types';
import type { Series, CreateSeriesRequest, UpdateSeriesRequest } from '../types';

export class RealSeriesAPI {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async getSeries(): Promise<APIResponse<Series[]>> {
    const response = await this.client.get<Series[]>('/series', {
      tags: ['series'],
      ttl: 2 * 60 * 1000
    });

    if (response.success && response.data) {
      response.data = response.data.map(s => ({
        ...s,
        createdAt: new Date(s.createdAt)
      }));
    }

    return response;
  }

  async getSeriesById(seriesId: string): Promise<APIResponse<Series>> {
    const response = await this.client.get<Series>(`/series/${seriesId}`, {
      tags: ['series', `series-${seriesId}`],
      ttl: 2 * 60 * 1000
    });

    if (response.success && response.data) {
      response.data.createdAt = new Date(response.data.createdAt);
    }

    return response;
  }

  async createSeries(request: CreateSeriesRequest): Promise<APIResponse<Series>> {
    const response = await this.client.post<Series>('/series', request);

    if (response.success && response.data) {
      response.data.createdAt = new Date(response.data.createdAt);
      this.client.invalidateByTag('series');
    }

    return response;
  }

  async updateSeries(seriesId: string, request: UpdateSeriesRequest): Promise<APIResponse<Series>> {
    const response = await this.client.patch<Series>(`/series/${seriesId}`, request);

    if (response.success && response.data) {
      response.data.createdAt = new Date(response.data.createdAt);
      this.client.invalidateByTag('series');
      this.client.invalidateByTag(`series-${seriesId}`);
    }

    return response;
  }

  async deleteSeries(seriesId: string): Promise<APIResponse<void>> {
    const response = await this.client.delete<void>(`/series/${seriesId}`);

    if (response.success) {
      this.client.invalidateByTag('series');
      this.client.invalidateByTag(`series-${seriesId}`);
    }

    return response;
  }
}
