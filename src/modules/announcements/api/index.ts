/**
 * Announcements Module - API Layer
 *
 * This file handles switching between mock and real APIs for the Announcements module.
 *
 * To switch between mock and real APIs:
 * 1. Set VITE_USE_MOCK_API=true in .env for mock mode
 * 2. Set VITE_USE_MOCK_API=false in .env for real API mode
 * 3. Set VITE_API_BASE_URL to your backend URL when using real API
 *
 * The decision is made at runtime based on environment configuration.
 */

import { shouldUseMockAPI, apiBaseURL } from '@/modules/core';
import { AnnouncementsMockAPI } from './mock';
import { AnnouncementsRealAPI } from './real';
import type { APIResponse } from '@/modules/core';
import type { Announcement } from '../types';

class AnnouncementsAPIService {
  private static instance: AnnouncementsAPIService | null = null;
  private apiInstance: AnnouncementsMockAPI | AnnouncementsRealAPI | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): AnnouncementsAPIService {
    if (!AnnouncementsAPIService.instance) {
      AnnouncementsAPIService.instance = new AnnouncementsAPIService();
    }
    return AnnouncementsAPIService.instance;
  }

  private async initializeAPI(): Promise<void> {
    if (this.apiInstance) return;

    const useMock = await shouldUseMockAPI();

    if (useMock) {
      console.log('[Announcements] Using mock API for development');
      this.apiInstance = new AnnouncementsMockAPI();
    } else {
      console.log('[Announcements] Using real API:', apiBaseURL);
      this.apiInstance = new AnnouncementsRealAPI();
    }
  }

  private async getAPI(): Promise<AnnouncementsMockAPI | AnnouncementsRealAPI> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeAPI();
    }
    await this.initializationPromise;
    return this.apiInstance!;
  }

  async getAnnouncements(): Promise<APIResponse<Announcement[]>> {
    const api = await this.getAPI();
    return api.getAnnouncements();
  }
}

export const announcementsAPI = AnnouncementsAPIService.getInstance();