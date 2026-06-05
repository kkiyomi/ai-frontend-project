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

  async toggleChapterPublished(chapterUuid: string, isPublished: boolean): Promise<APIResponse<{ is_published: boolean }>> {
    return apiClient.patch<{ is_published: boolean }>(`/publish/chapters/${chapterUuid}`, { isPublished });
  }
}
