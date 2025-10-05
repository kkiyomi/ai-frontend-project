import { shouldUseMockAPI, apiBaseURL } from '@/modules/core';
import { ChapterMockAPI } from './mock';
import { ChapterRealAPI } from './real';
import type { APIResponse } from '@/modules/core';
import type { Chapter, ChapterCreateInput, ChapterUpdateInput } from '../types';

class ChapterAPIService {
  private static instance: ChapterAPIService | null = null;
  private apiInstance: ChapterMockAPI | ChapterRealAPI | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): ChapterAPIService {
    if (!ChapterAPIService.instance) {
      ChapterAPIService.instance = new ChapterAPIService();
    }
    return ChapterAPIService.instance;
  }

  private async initializeAPI(): Promise<void> {
    if (this.apiInstance) return;

    const useMock = await shouldUseMockAPI();

    if (useMock) {
      console.log('[Chapters] Using mock API for development');
      this.apiInstance = new ChapterMockAPI();
    } else {
      console.log('[Chapters] Using real API:', apiBaseURL);
      this.apiInstance = new ChapterRealAPI(apiBaseURL);
    }
  }

  private async getAPI(): Promise<ChapterMockAPI | ChapterRealAPI> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeAPI();
    }
    await this.initializationPromise;
    return this.apiInstance!;
  }

  async getChapters(seriesId?: string): Promise<APIResponse<Chapter[]>> {
    const api = await this.getAPI();
    return api.getChapters(seriesId);
  }

  async createChapter(input: ChapterCreateInput): Promise<APIResponse<Chapter>> {
    const api = await this.getAPI();
    return api.createChapter(input);
  }

  async updateChapter(chapterId: string, updates: ChapterUpdateInput): Promise<APIResponse<Chapter>> {
    const api = await this.getAPI();
    return api.updateChapter(chapterId, updates);
  }

  async deleteChapter(chapterId: string): Promise<APIResponse<void>> {
    const api = await this.getAPI();
    return api.deleteChapter(chapterId);
  }
}

export const chapterAPI = ChapterAPIService.getInstance();
