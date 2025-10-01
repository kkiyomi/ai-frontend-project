import { shouldUseMockAPI, apiBaseURL } from '@/modules/core';
import { EditorMockAPI } from './mock';
import { EditorRealAPI } from './real';
import { AutoEnrichChapters } from '../utils';
import type { APIResponse } from '@/modules/core';
import type { EditorTerm } from '../types';

class EditorAPIService {
  private static instance: EditorAPIService | null = null;
  private apiInstance: EditorMockAPI | EditorRealAPI | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): EditorAPIService {
    if (!EditorAPIService.instance) {
      EditorAPIService.instance = new EditorAPIService();
    }
    return EditorAPIService.instance;
  }

  private async initializeAPI(): Promise<void> {
    if (this.apiInstance) return;

    const useMock = await shouldUseMockAPI();
    let DecoratedEditorAPI;

    if (useMock) {
      console.log('[Editor] Using mock API for development');
      DecoratedEditorAPI = AutoEnrichChapters(EditorMockAPI);
    } else {
      console.log('[Editor] Using real API:', apiBaseURL);
      DecoratedEditorAPI = AutoEnrichChapters(EditorRealAPI);
    }
    this.apiInstance = new DecoratedEditorAPI();
  }

  private async getAPI(): Promise<EditorMockAPI | EditorRealAPI> {
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

  async getChapter(chapterId: string): Promise<APIResponse<Chapter>> {
    const api = await this.getAPI();
    return api.getChapter(chapterId);
  }

  async createChapter(
    title: string,
    content: string,
    seriesId: string
  ): Promise<APIResponse<Chapter>> {
    const api = await this.getAPI();
    return api.createChapter(title, content, seriesId);
  }

  async updateChapter(
    chapterId: string,
    updates: Partial<Chapter>
  ): Promise<APIResponse<Chapter>> {
    const api = await this.getAPI();
    return api.updateChapter(chapterId, updates);
  }

  async deleteChapter(chapterId: string): Promise<APIResponse<void>> {
    const api = await this.getAPI();
    return api.deleteChapter(chapterId);
  }

  async batchUpdateChapters(
    updates: Array<{ id: string; changes: Partial<Chapter> }>
  ): Promise<APIResponse<Chapter[]>> {
    const api = await this.getAPI();
    return api.batchUpdateChapters(updates);
  }
}

export const editorAPI = EditorAPIService.getInstance();

