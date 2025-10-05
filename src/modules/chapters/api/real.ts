import { APIClient, type APIResponse } from '@/modules/core';
import type { Chapter, ChapterCreateInput, ChapterUpdateInput } from '../types';

export class ChapterRealAPI {
  private client: APIClient;

  constructor(baseURL: string) {
    this.client = new APIClient(baseURL);
  }

  async getChapters(seriesId?: string): Promise<APIResponse<Chapter[]>> {
    const endpoint = seriesId ? `/chapters?seriesId=${seriesId}` : '/chapters';
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
