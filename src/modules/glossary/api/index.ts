/**
 * Glossary Module - API Layer
 *
 * This file handles switching between mock and real APIs for the Glossary module.
 *
 * To switch between mock and real APIs:
 * 1. Set VITE_USE_MOCK_API=true in .env for mock mode
 * 2. Set VITE_USE_MOCK_API=false in .env for real API mode
 * 3. Set VITE_API_BASE_URL to your backend URL when using real API
 *
 * The decision is made at runtime based on environment configuration.
 */

import { shouldUseMockAPI, apiBaseURL } from '@/modules/core';
import { GlossaryMockAPI } from './mock';
import { GlossaryRealAPI } from './real';
import type { APIResponse } from '@/modules/core';
import type { GlossaryTerm } from '../types';

class GlossaryAPIService {
  private static instance: GlossaryAPIService | null = null;
  private apiInstance: GlossaryMockAPI | GlossaryRealAPI | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): GlossaryAPIService {
    if (!GlossaryAPIService.instance) {
      GlossaryAPIService.instance = new GlossaryAPIService();
    }
    return GlossaryAPIService.instance;
  }

  private async initializeAPI(): Promise<void> {
    if (this.apiInstance) return;

    const useMock = await shouldUseMockAPI();

    if (useMock) {
      console.log('[Glossary] Using mock API for development');
      this.apiInstance = new GlossaryMockAPI();
    } else {
      console.log('[Glossary] Using real API:', apiBaseURL);
      this.apiInstance = new GlossaryRealAPI();
    }
  }

  private async getAPI(): Promise<GlossaryMockAPI | GlossaryRealAPI> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeAPI();
    }
    await this.initializationPromise;
    return this.apiInstance!;
  }

  async getGlossaryTerms(seriesId?: string, chapterId?: string): Promise<APIResponse<GlossaryTerm[]>> {
    const api = await this.getAPI();
    return api.getGlossaryTerms(seriesId, chapterId);
  }

  async createGlossaryTerm(term: Omit<GlossaryTerm, 'id' | 'frequency'>): Promise<APIResponse<GlossaryTerm>> {
    const api = await this.getAPI();
    return api.createGlossaryTerm(term);
  }

  async updateGlossaryTerm(termId: string, updates: Partial<GlossaryTerm>): Promise<APIResponse<GlossaryTerm>> {
    const api = await this.getAPI();
    return api.updateGlossaryTerm(termId, updates);
  }

  async deleteGlossaryTerm(termId: string): Promise<APIResponse<void>> {
    const api = await this.getAPI();
    return api.deleteGlossaryTerm(termId);
  }
}

export const glossaryAPI = GlossaryAPIService.getInstance();
