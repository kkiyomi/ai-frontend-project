/**
 * Sharing Module - API Layer
 *
 * This file handles switching between mock and real APIs for the Sharing module.
 *
 * To switch between mock and real APIs:
 * 1. Set VITE_USE_MOCK_API=true in .env for mock mode
 * 2. Set VITE_USE_MOCK_API=false in .env for real API mode
 * 3. Set VITE_API_BASE_URL to your backend URL when using real API
 *
 * The decision is made at runtime based on environment configuration.
 */

import { shouldUseMockAPI, apiBaseURL } from '@/modules/core';
import { mockSharingAPI } from './mock';
import { realSharingAPI } from './real';
import type { APIResponse } from '@/modules/core';
import type { ShareRequest, ShareResponse, SharedContent, ShareStats } from '../types';

class SharingAPIService {
  private static instance: SharingAPIService | null = null;
  private apiInstance: typeof mockSharingAPI | typeof realSharingAPI | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): SharingAPIService {
    if (!SharingAPIService.instance) {
      SharingAPIService.instance = new SharingAPIService();
    }
    return SharingAPIService.instance;
  }

  private async initializeAPI(): Promise<void> {
    if (this.apiInstance) return;

    const useMock = await shouldUseMockAPI();

    if (useMock) {
      console.log('[Sharing] Using mock API for development');
      this.apiInstance = mockSharingAPI;
    } else {
      console.log('[Sharing] Using real API:', apiBaseURL);
      this.apiInstance = realSharingAPI;
    }
  }

  private async getAPI(): Promise<typeof mockSharingAPI | typeof realSharingAPI> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeAPI();
    }
    await this.initializationPromise;
    return this.apiInstance!;
  }

  async createShare(request: ShareRequest): Promise<APIResponse<ShareResponse>> {
    const api = await this.getAPI();
    return api.createShare(request);
  }

  async getSharedContent(shareId: string): Promise<APIResponse<SharedContent>> {
    const api = await this.getAPI();
    return api.getSharedContent(shareId);
  }

  async verifySharePassword(
    shareId: string,
    password: string
  ): Promise<APIResponse<boolean>> {
    const api = await this.getAPI();
    return api.verifySharePassword(shareId, password);
  }

  async getShareStats(shareId: string): Promise<APIResponse<ShareStats>> {
    const api = await this.getAPI();
    return api.getShareStats(shareId);
  }

  async deleteShare(shareId: string): Promise<APIResponse<void>> {
    const api = await this.getAPI();
    return api.deleteShare(shareId);
  }

  async getChaptersByIds(chapterIds: string[]): Promise<APIResponse<any[]>> {
    const api = await this.getAPI();
    return api.getChaptersByIds(chapterIds);
  }

  async listShares(): Promise<APIResponse<SharedContent[]>> {
    const api = await this.getAPI();
    return api.listShares();
  }
}

export const sharingAPI = SharingAPIService.getInstance();
