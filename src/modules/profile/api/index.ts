/**
 * Profile Module - API Layer
 *
 * This file handles switching between mock and real APIs for the Profile module.
 *
 * To switch between mock and real APIs:
 * 1. Set VITE_USE_MOCK_API=true in .env for mock mode
 * 2. Set VITE_USE_MOCK_API=false in .env for real API mode
 * 3. Set VITE_API_BASE_URL to your backend URL when using real API
 *
 * The decision is made at runtime based on environment configuration.
 */

import { shouldUseMockAPI, apiBaseURL } from '@/modules/core';
import { ProfileMockAPI } from './mock';
import { ProfileRealAPI } from './real';
import type { APIResponse } from '@/modules/core';
import type { User } from '../types';

class ProfileAPIService {
  private static instance: ProfileAPIService | null = null;
  private apiInstance: ProfileMockAPI | ProfileRealAPI | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): ProfileAPIService {
    if (!ProfileAPIService.instance) {
      ProfileAPIService.instance = new ProfileAPIService();
    }
    return ProfileAPIService.instance;
  }

  private async initializeAPI(): Promise<void> {
    if (this.apiInstance) return;

    const useMock = await shouldUseMockAPI();

    if (useMock) {
      console.log('[Profile] Using mock API for development');
      this.apiInstance = new ProfileMockAPI();
    } else {
      console.log('[Profile] Using real API:', apiBaseURL);
      this.apiInstance = new ProfileRealAPI();
    }
  }

  private async getAPI(): Promise<ProfileMockAPI | ProfileRealAPI> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeAPI();
    }
    await this.initializationPromise;
    return this.apiInstance!;
  }

  async getProfile(): Promise<APIResponse<User>> {
    const api = await this.getAPI();
    return api.getProfile();
  }

  async updateProfile(updates: Partial<User>): Promise<APIResponse<User>> {
    const api = await this.getAPI();
    return api.updateProfile(updates);
  }
}

export const profileAPI = ProfileAPIService.getInstance();