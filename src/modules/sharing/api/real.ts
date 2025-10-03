import type { APIResponse } from '../../core/types';
import type { ShareRequest, ShareResponse, SharedContent } from '../types';
import { apiClient } from '../../core/services';

/**
 * Real Sharing API - uses Core apiClient for HTTP requests
 *
 * How it works:
 * - Imports the shared apiClient instance from Core module
 * - apiClient provides: caching, error handling, request interceptors
 * - All endpoints return APIResponse<T> for consistent error handling
 *
 * Example usage:
 * import { sharingAPI } from '@/modules/sharing';
 *
 * const result = await sharingAPI.createShare({
 *   chapterIds: ['ch1'],
 *   seriesIds: ['s1'],
 *   title: 'My Translation'
 * });
 *
 * if (result.success) {
 *   console.log('Share URL:', result.data.shareUrl);
 * }
 */

export class RealSharingAPI {
  /**
   * Creates a new share link
   */
  async createShare(request: ShareRequest): Promise<APIResponse<ShareResponse>> {
    return apiClient.post<ShareResponse>('/api/shares', request);
  }

  /**
   * Retrieves shared content by ID
   */
  async getSharedContent(shareId: string): Promise<APIResponse<SharedContent>> {
    return apiClient.get<SharedContent>(`/api/shares/${shareId}`);
  }

  /**
   * Verifies password for password-protected shares
   */
  async verifySharePassword(
    shareId: string,
    password: string
  ): Promise<APIResponse<boolean>> {
    return apiClient.post<boolean>(`/api/shares/${shareId}/verify`, { password });
  }

  /**
   * Deletes a share
   */
  async deleteShare(shareId: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`/api/shares/${shareId}`);
  }

  /**
   * Gets share statistics
   */
  async getShareStats(shareId: string): Promise<APIResponse<any>> {
    return apiClient.get(`/api/shares/${shareId}/stats`);
  }

  /**
   * Lists all shares (if authenticated)
   */
  async listShares(): Promise<APIResponse<SharedContent[]>> {
    return apiClient.get<SharedContent[]>('/api/shares');
  }
}

export const realSharingAPI = new RealSharingAPI();
