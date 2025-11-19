/**
 * Billing Module - API Layer
 *
 * This file handles switching between mock and real APIs for the Billing module.
 *
 * To switch between mock and real APIs:
 * 1. Set VITE_USE_MOCK_API=true in .env for mock mode
 * 2. Set VITE_USE_MOCK_API=false in .env for real API mode
 * 3. Set VITE_API_BASE_URL to your backend URL when using real API
 *
 * The decision is made at runtime based on environment configuration.
 */

import { shouldUseMockAPI, apiBaseURL } from '@/modules/core';
import { BillingMockAPI } from './mock';
import { BillingRealAPI } from './real';
import type { APIResponse } from '@/modules/core';
import type { Subscription } from '../types';

class BillingAPIService {
  private static instance: BillingAPIService | null = null;
  private apiInstance: BillingMockAPI | BillingRealAPI | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): BillingAPIService {
    if (!BillingAPIService.instance) {
      BillingAPIService.instance = new BillingAPIService();
    }
    return BillingAPIService.instance;
  }

  private async initializeAPI(): Promise<void> {
    if (this.apiInstance) return;

    const useMock = await shouldUseMockAPI();

    if (useMock) {
      console.log('[Billing] Using mock API for development');
      this.apiInstance = new BillingMockAPI();
    } else {
      console.log('[Billing] Using real API:', apiBaseURL);
      this.apiInstance = new BillingRealAPI();
    }
  }

  private async getAPI(): Promise<BillingMockAPI | BillingRealAPI> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeAPI();
    }
    await this.initializationPromise;
    return this.apiInstance!;
  }

  async getSubscription(): Promise<APIResponse<Subscription>> {
    const api = await this.getAPI();
    return api.getSubscription();
  }
}

export const billingAPI = BillingAPIService.getInstance();