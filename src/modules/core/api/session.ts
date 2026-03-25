/**
 * Core Module - Session API Service
 * 
 * Provides authentication/session checking functionality using the core APIClient.
 * This is a production-only API service (no mock implementation needed since
 * session checking only occurs when using real API mode).
 * 
 * IMPORTANT: This service should only be called when VITE_USE_MOCK_API=false
 * and apiBaseURL is configured for a real backend.
 * 
 * Usage Example:
 * ```typescript
 * import { sessionAPI } from '@/modules/core';
 * 
 * const result = await sessionAPI.checkSession();
 * if (result.success && result.data?.authenticated) {
 *   // User is logged in
 * }
 * ```
 */

import { apiClient, type APIResponse } from '@/modules/core';

export interface SessionCheckResponse {
  authenticated: boolean;
}

export interface CheckSessionOptions {
  /**
   * Force a fresh check, bypassing the APIClient cache
   * @default false
   */
  forceRefresh?: boolean;
}

export class SessionAPIService {
  /**
   * Checks if the current user has a valid session with the backend.
   * 
   * This endpoint should return { authenticated: true } if the user has
   * valid authentication cookies/session, otherwise { authenticated: false }.
   * 
   * The APIClient automatically includes credentials (cookies) with the request.
   * 
   * @param options - Optional configuration for the session check
   */
  async checkSession(options?: CheckSessionOptions): Promise<APIResponse<SessionCheckResponse>> {
    return apiClient.get<SessionCheckResponse>('/check_session', {
      // Short TTL for session checks (1 minute) since login state can change
      ttl: 60 * 1000,
      // Bypass cache on force refresh
      bypassCache: options?.forceRefresh ?? false,
      // Tag for cache invalidation
      tags: ['session']
    });
  }
}

// Singleton instance for consistent usage across the application
export const sessionAPI = new SessionAPIService();