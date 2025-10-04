import { APIClient } from '@/modules/core/services/apiClient';
import { apiBaseURL, isMockMode } from '@/modules/core/utils/environment';
import { MockSeriesAPI } from './mock';
import { RealSeriesAPI } from './real';
import type { APIResponse } from '@/modules/core/types';
import type { Series, CreateSeriesRequest, UpdateSeriesRequest } from '../types';

/**
 * Series API - handles all series-related network requests
 *
 * HOW TO USE:
 *
 * 1. Import the seriesAPI singleton:
 *    import { seriesAPI } from '@/modules/series';
 *
 * 2. Call methods directly:
 *    const response = await seriesAPI.getSeries();
 *    if (response.success) {
 *      console.log(response.data);
 *    }
 *
 * TOGGLE BETWEEN MOCK AND REAL API:
 *
 * The API automatically switches based on the environment configuration
 * in src/modules/core/utils/environment.ts
 *
 * - To use MOCK API: Set `useMockAPI = true` in environment.ts
 * - To use REAL API: Set `useMockAPI = false` in environment.ts
 *
 * You can also check at runtime: isMockMode() returns true if using mock data
 */

interface SeriesAPIInterface {
  getSeries(): Promise<APIResponse<Series[]>>;
  getSeriesById(seriesId: string): Promise<APIResponse<Series>>;
  createSeries(request: CreateSeriesRequest): Promise<APIResponse<Series>>;
  updateSeries(seriesId: string, request: UpdateSeriesRequest): Promise<APIResponse<Series>>;
  deleteSeries(seriesId: string): Promise<APIResponse<void>>;
}

class SeriesAPI implements SeriesAPIInterface {
  private api: MockSeriesAPI | RealSeriesAPI;

  constructor() {
    if (isMockMode()) {
      console.log('🔧 Series API: Using mock data');
      this.api = new MockSeriesAPI();
    } else {
      console.log('🌐 Series API: Using real backend at', apiBaseURL);
      const client = new APIClient(apiBaseURL);
      this.api = new RealSeriesAPI(client);
    }
  }

  async getSeries(): Promise<APIResponse<Series[]>> {
    return this.api.getSeries();
  }

  async getSeriesById(seriesId: string): Promise<APIResponse<Series>> {
    return this.api.getSeriesById(seriesId);
  }

  async createSeries(request: CreateSeriesRequest): Promise<APIResponse<Series>> {
    return this.api.createSeries(request);
  }

  async updateSeries(seriesId: string, request: UpdateSeriesRequest): Promise<APIResponse<Series>> {
    return this.api.updateSeries(seriesId, request);
  }

  async deleteSeries(seriesId: string): Promise<APIResponse<void>> {
    return this.api.deleteSeries(seriesId);
  }
}

export const seriesAPI = new SeriesAPI();
