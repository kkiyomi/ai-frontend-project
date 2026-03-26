/**
 * Announcements Module - Real API Implementation
 *
 * This file defines the real HTTP endpoints for announcements operations.
 * Uses Core's generic APIClient for HTTP communication.
 *
 * IMPORTANT: This is feature-specific API logic. Core module does NOT know about
 * announcements endpoints - each feature module owns its own API definitions.
 */

import { apiClient, type APIResponse } from '@/modules/core';
import type { Announcement } from '../types';

export class AnnouncementsRealAPI {
  async getAnnouncements(): Promise<APIResponse<Announcement[]>> {
    return apiClient.get<Announcement[]>('/announcements');
  }
}