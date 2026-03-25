/**
 * Core Module - Session Management Composable
 * 
 * Provides reactive session state with request deduplication.
 * Uses the sessionAPI for HTTP communication (which uses APIClient caching).
 * 
 * Features:
 * - Reactive isLoggedIn state
 * - Request deduplication (singleton promises)
 * - Manual cache invalidation (clears APIClient cache)
 * - Loading and error states
 * 
 * IMPORTANT: Caching is handled by APIClient (1-minute TTL for session checks).
 * This composable does NOT add additional caching layers.
 * 
 * Usage Example:
 * ```typescript
 * import { useSession } from '@/modules/core';
 * 
 * const { isLoggedIn, isLoading, checkSession } = useSession();
 * 
 * // Check session (uses APIClient cache unless forced)
 * const loggedIn = await checkSession();
 * 
 * // Force refresh (bypasses APIClient cache)
 * const freshStatus = await checkSession(true);
 * 
 * // Invalidate cache manually (e.g., after logout)
 * invalidateCache();
 * ```
 */

import { ref, computed } from 'vue';
import { sessionAPI, type SessionCheckResponse, type CheckSessionOptions } from '../api/session';
import { apiClient } from '@/modules/core';

// Singleton promise for request deduplication across the application
let activeCheckPromise: Promise<boolean> | null = null;

export function useSession() {
  // --- Environment Detection ---
  const isProduction = import.meta.env.PROD;
  const isDevelopment = import.meta.env.DEV;
  
  // --- Reactive State ---
  const isLoggedIn = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const lastChecked = ref<number>(0);

  // --- Internal Helper Functions ---
  
  /**
   * Updates session state from API response
   */
  function updateSessionState(response: SessionCheckResponse): void {
    isLoggedIn.value = response.authenticated === true;
    lastChecked.value = Date.now();
    error.value = null;
  }

  /**
   * Clears session state (e.g., on logout or error)
   */
  function clearSessionState(): void {
    isLoggedIn.value = false;
    lastChecked.value = 0;
  }

  /**
   * Handles API errors and updates error state
   */
  function handleSessionError(err: unknown): void {
    error.value = err instanceof Error ? err.message : 'Unknown error checking session';
    clearSessionState();
    console.warn('Session check failed:', error.value);
  }

  // --- Public API ---
  
  /**
   * Checks if the user has a valid session.
   * 
   * IMPORTANT: Session checks only occur in production environment (isProduction === true).
   * In development or other non-production environments, returns false immediately.
   * 
   * Uses APIClient caching (1-minute TTL) unless force is true.
   * Request deduplication prevents concurrent identical requests.
   * 
   * @param force - Bypass APIClient cache and force a fresh check
   * @returns Promise resolving to true if logged in, false otherwise
   */
  async function checkSession(force = false): Promise<boolean> {
//     // Only check session in production environment
//     if (!isProduction) {
//       if (isDevelopment) {
//         console.log('[Session] Skipping session check in non-production environment');
//       }
//       return false;
//     }

    // If there's already an active request, wait for it (unless forcing refresh)
    if (activeCheckPromise && !force) {
      try {
        return await activeCheckPromise;
      } catch (err) {
        // If the active promise fails, continue with new request
        console.warn('Active session check promise failed, retrying:', err);
      }
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Create new singleton promise
      const checkPromise = (async (): Promise<boolean> => {
        try {
          const result = await sessionAPI.checkSession({ forceRefresh: force });
          
          if (result.success && result.data) {
            updateSessionState(result.data);
            return result.data.authenticated === true;
          } else {
            // API call succeeded but returned error response
            handleSessionError(result.error || 'Session check failed');
            return false;
          }
        } catch (err) {
          handleSessionError(err);
          return false;
        } finally {
          activeCheckPromise = null;
        }
      })();

      activeCheckPromise = checkPromise;
      return await checkPromise;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Invalidates the session cache at both levels:
   * 1. Clears APIClient cache for session endpoint (via tag)
   * 2. Resets local reactive state
   * 3. Clears singleton promise to allow new requests
   */
  function invalidateCache(): void {
    // Clear APIClient cache for session endpoint
    apiClient.invalidateByTag('session');
    
    // Reset local state
    clearSessionState();
    activeCheckPromise = null;
    error.value = null;
  }

  /**
   * Manually sets the logged in state (e.g., after login/logout in UI).
   * Use with caution - prefer checkSession() for accurate state.
   * 
   * Note: This does NOT affect APIClient cache. Use invalidateCache() after
   * login/logout to ensure fresh session checks.
   * 
   * @param loggedIn - New login state
   */
  function setLoggedIn(loggedIn: boolean): void {
    isLoggedIn.value = loggedIn;
    lastChecked.value = Date.now();
    error.value = null;
  }

  // --- Computed Properties ---
  
  const hasChecked = computed(() => {
    return lastChecked.value > 0;
  });

  // --- Return public API ---
  return {
    // State
    isLoggedIn: computed(() => isLoggedIn.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    lastChecked: computed(() => lastChecked.value),
    
    // Computed
    hasChecked,
    
    // Actions
    checkSession,
    invalidateCache,
    setLoggedIn,
  };
}

// Singleton instance for use by environment.ts and other modules
// that need shared session state without creating multiple instances
let sharedSessionInstance: ReturnType<typeof useSession> | null = null;

export function getSharedSession() {
  if (!sharedSessionInstance) {
    sharedSessionInstance = useSession();
  }
  return sharedSessionInstance;
}