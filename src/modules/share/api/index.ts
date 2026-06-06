/**
 * Share Module - API Layer
 * All endpoints are real (no mock). Public reader uses raw fetch,
 * publisher CRUD uses the authenticated apiClient.
 */
import {
  fetchSharedChapter,
  fetchSharedSeries,
  fetchSharedChapterInSeries,
} from './share';
import { PublishRealAPI } from './publish';
import type { APIResponse } from '@/modules/core';
import type {
  SharedChapterData,
  SharedSeriesData,
  ShareLink,
  CreateShareLinkRequest,
} from '../types';

const publish = new PublishRealAPI();

class ShareAPIService {
  private static instance: ShareAPIService | null = null;

  private constructor() {}

  static getInstance(): ShareAPIService {
    if (!ShareAPIService.instance) {
      ShareAPIService.instance = new ShareAPIService();
    }
    return ShareAPIService.instance;
  }

  // --- Public reader endpoints ---

  async getSharedChapter(uuid: string): Promise<SharedChapterData> {
    return fetchSharedChapter(uuid);
  }

  async getSharedSeries(uuid: string): Promise<SharedSeriesData> {
    return fetchSharedSeries(uuid);
  }

  async getSharedChapterInSeries(seriesUuid: string, chapterUuid: string): Promise<SharedChapterData> {
    return fetchSharedChapterInSeries(seriesUuid, chapterUuid);
  }

  // --- Translator publisher endpoints ---

  async createShareLink(request: CreateShareLinkRequest): Promise<APIResponse<ShareLink>> {
    return publish.createShareLink(request);
  }

  async listShareLinks(): Promise<APIResponse<ShareLink[]>> {
    return publish.listShareLinks();
  }

  async revokeShareLink(uuid: string): Promise<APIResponse<void>> {
    return publish.revokeShareLink(uuid);
  }

  async toggleChapterPublished(chapterUuid: string, isPublished: boolean): Promise<APIResponse<{ is_published: boolean }>> {
    return publish.toggleChapterPublished(chapterUuid, isPublished);
  }

  async updateShareLink(uuid: string, data: { includeGlossary?: boolean; includeRaw?: boolean; name?: string }): Promise<APIResponse<ShareLink>> {
    return publish.updateShareLink(uuid, data);
  }
}

export const shareAPI = ShareAPIService.getInstance();
