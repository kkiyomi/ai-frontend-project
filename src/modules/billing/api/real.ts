/**
 * Billing Module - Real API Implementation
 *
 * This file defines the real HTTP endpoints for billing operations.
 * Uses Core's generic APIClient for HTTP communication.
 *
 * IMPORTANT: This is feature-specific API logic. Core module does NOT know about
 * billing endpoints - each feature module owns its own API definitions.
 */

import { apiClient, type APIResponse } from '@/modules/core';
import type { Subscription } from '../types';

export class BillingRealAPI {
  async getSubscription(): Promise<APIResponse<Subscription>> {
    return apiClient.get<Subscription>('/billing/subscription');
  }

  async getPlans(): Promise<APIResponse<any[]>> {
    return apiClient.get<any[]>('/billing/plans');
  }

  async updateSubscription(planId: string): Promise<APIResponse<Subscription>> {
    return apiClient.post<Subscription>('/billing/subscription', { planId });
  }

  async cancelSubscription(): Promise<APIResponse<void>> {
    return apiClient.delete<void>('/billing/subscription');
  }
}