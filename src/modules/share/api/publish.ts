/**
 * Share Module - Real Publisher API Implementation
 * Uses the authenticated apiClient for translator-facing CRUD.
 */
import { apiClient, type APIResponse } from '@/modules/core';
import type { ShareLink, CreateShareLinkRequest } from '../types';

export class PublishRealAPI {
  async createShareLink(request: CreateShareLinkRequest): Promise<APIResponse<ShareLink>> {
    return apiClient.post<ShareLink>('/publish/links', request, { showModal: true });
  }

  async listShareLinks(): Promise<APIResponse<ShareLink[]>> {
    return apiClient.get<ShareLink[]>('/publish/links');
  }

  async revokeShareLink(uuid: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`/publish/links/${uuid}`);
  }

  async updateShareLink(uuid: string, data: { includeGlossary?: boolean; includeRaw?: boolean; name?: string }): Promise<APIResponse<ShareLink>> {
    return apiClient.patch<ShareLink>(`/publish/links/${uuid}`, data);
  }

  async toggleChapterPublished(chapterUuid: string, isPublished: boolean): Promise<APIResponse<{ is_published: boolean }>> {
    return apiClient.patch<{ is_published: boolean }>(`/publish/chapters/${chapterUuid}`, { isPublished });
  }

  async batchToggleChaptersPublished(uuids: string[], isPublished: boolean): Promise<APIResponse<{ updated: number }>> {
    return apiClient.patch<{ updated: number }>('/publish/chapters', { uuids, isPublished });
  }
}
