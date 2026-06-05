/**
 * Share Module - API Layer
 * Switches between mock and real implementations for:
 * - Translator publisher endpoints (session auth, mock-able for dev)
 * - Public reader endpoints (ALWAYS real — these are public pages)
 */
import { shouldUseMockAPI } from '@/modules/core';
import {
  fetchSharedChapter as realFetchSharedChapter,
  fetchSharedSeries as realFetchSharedSeries,
  fetchSharedChapterInSeries as realFetchSharedChapterInSeries,
} from './share';
import { PublishRealAPI } from './publish';
import { PublishMockAPI } from './publishMock';
import type { APIResponse } from '@/modules/core';
import type {
  SharedChapterData,
  SharedSeriesData,
  ShareLink,
  CreateShareLinkRequest,
} from '../types';

class ShareAPIService {
  private static instance: ShareAPIService | null = null;
  private publishImpl: PublishRealAPI | PublishMockAPI | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): ShareAPIService {
    if (!ShareAPIService.instance) {
      ShareAPIService.instance = new ShareAPIService();
    }
    return ShareAPIService.instance;
  }

  private async initialize(): Promise<void> {
    if (this.publishImpl !== null) return;
    const useMock = await shouldUseMockAPI();
    this.publishImpl = useMock ? new PublishMockAPI() : new PublishRealAPI();
  }

  private async getPublish(): Promise<PublishRealAPI | PublishMockAPI> {
    if (!this.initPromise) {
      this.initPromise = this.initialize();
    }
    await this.initPromise;
    return this.publishImpl!;
  }

  // --- Public reader endpoints — ALWAYS REAL, never mock ---

  async getSharedChapter(uuid: string): Promise<SharedChapterData> {
    return realFetchSharedChapter(uuid);
  }

  async getSharedSeries(uuid: string): Promise<SharedSeriesData> {
    return realFetchSharedSeries(uuid);
  }

  async getSharedChapterInSeries(seriesUuid: string, chapterUuid: string): Promise<SharedChapterData> {
    return realFetchSharedChapterInSeries(seriesUuid, chapterUuid);
  }

  // --- Translator publisher endpoints (session auth, mock-aware for dev) ---

  async createShareLink(request: CreateShareLinkRequest): Promise<APIResponse<ShareLink>> {
    const api = await this.getPublish();
    return api.createShareLink(request);
  }

  async listShareLinks(): Promise<APIResponse<ShareLink[]>> {
    const api = await this.getPublish();
    return api.listShareLinks();
  }

  async revokeShareLink(uuid: string): Promise<APIResponse<void>> {
    const api = await this.getPublish();
    return api.revokeShareLink(uuid);
  }

  async toggleChapterPublished(chapterUuid: string, isPublished: boolean): Promise<APIResponse<{ is_published: boolean }>> {
    const api = await this.getPublish();
    return api.toggleChapterPublished(chapterUuid, isPublished);
  }
}

export const shareAPI = ShareAPIService.getInstance();
export { PublishRealAPI, PublishMockAPI };
