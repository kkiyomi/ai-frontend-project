/**
 * Profile Module - Real API Implementation
 *
 * This file defines the real HTTP endpoints for profile operations.
 * Uses Core's generic APIClient for HTTP communication.
 */

import { apiClient, type APIResponse } from '@/modules/core';
import type { User } from '../types';

export class ProfileRealAPI {
  async getProfile(): Promise<APIResponse<User>> {
    return apiClient.get<User>('/profile');
  }

  async updateProfile(updates: Partial<User>): Promise<APIResponse<User>> {
    return apiClient.patch<User>('/profile', updates);
  }
}