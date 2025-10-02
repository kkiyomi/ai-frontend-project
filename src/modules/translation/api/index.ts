/**
 * Translation Module - API Layer
 *
 * Handles switching between mock and real APIs for the Translation module.
 *
 * To switch between mock and real APIs:
 * 1. Set VITE_USE_MOCK_API=true in .env for mock mode
 * 2. Set VITE_USE_MOCK_API=false in .env for real API mode
 * 3. Set VITE_API_BASE_URL to your backend URL when using real API
 *
 * The decision is made at runtime based on environment configuration.
 */

import { shouldUseMockAPI, apiBaseURL } from '@/modules/core';
import { TranslationMockAPI } from './mock';
import { TranslationRealAPI } from './real';
import type { APIResponse } from '@/modules/core';

class TranslationAPIService {
  private static instance: TranslationAPIService | null = null;
  private apiInstance: TranslationMockAPI | TranslationRealAPI | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): TranslationAPIService {
    if (!TranslationAPIService.instance) {
      TranslationAPIService.instance = new TranslationAPIService();
    }
    return TranslationAPIService.instance;
  }

  private async initializeAPI(): Promise<void> {
    if (this.apiInstance) return;

    const useMock = await shouldUseMockAPI();

    if (useMock) {
      console.log('[Translation] Using mock API for development');
      this.apiInstance = new TranslationMockAPI();
    } else {
      console.log('[Translation] Using real API:', apiBaseURL);
      this.apiInstance = new TranslationRealAPI();
    }
  }

  private async getAPI(): Promise<TranslationMockAPI | TranslationRealAPI> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeAPI();
    }
    await this.initializationPromise;
    return this.apiInstance!;
  }

  async translateText(
    text: string,
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> {
    const api = await this.getAPI();
    return api.translateText(text, glossaryContext);
  }

  async translateParagraph(
    text: string,
    chapterId: string,
    paragraphIndex: number,
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> {
    const api = await this.getAPI();
    return api.translateParagraph(text, chapterId, paragraphIndex, glossaryContext);
  }

  async retranslateWithGlossary(
    originalText: string,
    currentTranslation: string,
    glossaryTerms: string[]
  ): Promise<APIResponse<string>> {
    const api = await this.getAPI();
    return api.retranslateWithGlossary(originalText, currentTranslation, glossaryTerms);
  }

  async suggestGlossaryTerms(text: string): Promise<APIResponse<string[]>> {
    const api = await this.getAPI();
    return api.suggestGlossaryTerms(text);
  }
}

export const translationAPI = TranslationAPIService.getInstance();
