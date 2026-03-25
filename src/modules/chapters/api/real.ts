import { APIClient, type APIResponse } from '@/modules/core';
import type { Chapter, ChapterCreateInput, ChapterUpdateInput } from '../types';

export class ChapterRealAPI {
  private client: APIClient;

  constructor(baseURL: string) {
    this.client = new APIClient(baseURL);
  }

  async getChapters(seriesId?: string, chapterIds?: string[]): Promise<APIResponse<Chapter[]>> {
    const params = new URLSearchParams();
    
    if (seriesId) {
      params.append('seriesId', seriesId);
    }
    
    if (chapterIds && chapterIds.length > 0) {
      // Assuming backend accepts comma-separated chapter IDs
      params.append('chapterIds', chapterIds.join(','));
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/chapters?${queryString}` : '/chapters';
    
    return this.client.get<Chapter[]>(endpoint);
  }

  async createChapter(input: ChapterCreateInput): Promise<APIResponse<Chapter>> {
    return this.client.post<Chapter>('/chapters', input);
  }

  async updateChapter(chapterId: string, updates: ChapterUpdateInput): Promise<APIResponse<Chapter>> {
    return this.client.patch<Chapter>(`/chapters/${chapterId}`, updates);
  }

  async deleteChapter(chapterId: string): Promise<APIResponse<void>> {
    return this.client.delete<void>(`/chapters/${chapterId}`);
  }
}
