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
}