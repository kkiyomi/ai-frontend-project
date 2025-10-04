/**
 * Series Module - API Layer
 *
 * This file handles switching between mock and real APIs for the Series module.
 *
 * To switch between mock and real APIs:
 * 1. Set VITE_USE_MOCK_API=true in .env for mock mode
 * 2. Set VITE_USE_MOCK_API=false in .env for real API mode
 * 3. Set VITE_API_BASE_URL to your backend URL when using real API
 *
 * The decision is made at runtime based on environment configuration.
 */

import { shouldUseMockAPI, apiBaseURL } from '@/modules/core';
import { SeriesMockAPI } from './mock';
import { SeriesRealAPI } from './real';
import type { APIResponse } from '@/modules/core';
import type { Series, CreateSeriesRequest, UpdateSeriesRequest } from '../types';

class SeriesAPIService {
  private static instance: SeriesAPIService | null = null;
  private apiInstance: SeriesMockAPI | SeriesRealAPI | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): SeriesAPIService {
    if (!SeriesAPIService.instance) {
      SeriesAPIService.instance = new SeriesAPIService();
    }
    return SeriesAPIService.instance;
  }

  private async initializeAPI(): Promise<void> {
    if (this.apiInstance) return;

    const useMock = await shouldUseMockAPI();

    if (useMock) {
      console.log('[Series] Using mock API for development');
      this.apiInstance = new SeriesMockAPI();
    } else {
      console.log('[Series] Using real API:', apiBaseURL);
      this.apiInstance = new SeriesRealAPI();
    }
  }

  private async getAPI(): Promise<SeriesMockAPI | SeriesRealAPI> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeAPI();
    }
    await this.initializationPromise;
    return this.apiInstance!;
  }

  async getSeries(): Promise<APIResponse<Series[]>> {
    const api = await this.getAPI();
    return api.getSeries();
  }

  async getSeriesById(seriesId: string): Promise<APIResponse<Series>> {
    const api = await this.getAPI();
    return api.getSeriesById(seriesId);
  }

  async createSeries(request: CreateSeriesRequest): Promise<APIResponse<Series>> {
    const api = await this.getAPI();
    return api.createSeries(request);
  }

  async updateSeries(seriesId: string, request: UpdateSeriesRequest): Promise<APIResponse<Series>> {
    const api = await this.getAPI();
    return api.updateSeries(seriesId, request);
  }

  async deleteSeries(seriesId: string): Promise<APIResponse<void>> {
    const api = await this.getAPI();
    return api.deleteSeries(seriesId);
  }
}

export const seriesAPI = SeriesAPIService.getInstance();
