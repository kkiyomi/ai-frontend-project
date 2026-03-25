// Core environment utilities - shared across all modules
// Uses session API with caching for session checks

import { getSharedSession } from '../composables/useSession';

// --- Environment Detection (Pure, No Side Effects) ---
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

/**
 * Whether to use mock API based on environment variable.
 * 
 * Parsing logic:
 * - 'true' (string) → true
 * - 'false' (string) → false  
 * - undefined/other → defaults to isDevelopment (backward compatibility)
 * 
 * IMPORTANT: This only reflects the ENV VAR setting, not runtime decision.
 * Use `shouldUseMockAPI()` for runtime decision including session status.
 */
export const useMockAPI = (() => {
  const envValue = import.meta.env.VITE_USE_MOCK_API;

  if (envValue === 'true') return true;
  if (envValue === 'false') return false;
  
  // Default to development mode for backward compatibility
  return isDevelopment;
})();

export const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// --- Shared Session Instance (Internal) ---
const sharedSession = getSharedSession();



// --- Session Management (Using Cached Session API) ---

/**
 * Checks if user has a valid session with the backend.
 * 
 * IMPORTANT: Session checks only occur in production environment (isProduction === true).
 * In development or other non-production environments, returns false immediately.
 * 
 * Uses caching and request deduplication via shared session composable.
 * 
 * @returns Promise resolving to true if logged in, false otherwise
 */
export const checkUserSession = async (): Promise<boolean> => {
  // If explicitly using mock API, no session to check
  if (useMockAPI === true) {
    return false;
  }
  
  // If no API base URL configured, cannot check session
  if (!apiBaseURL) {
    return false;
  }
  
  try {
    return await sharedSession.checkSession();
  } catch (error) {
    console.log('Session check failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

/**
 * Getter for backward-compatible isUserLoggedIn variable
 * @deprecated Use sharedSession.checkSession() or sharedSession.isLoggedIn.value
 */
export const getIsUserLoggedIn = (): boolean => {
  return sharedSession.isLoggedIn.value;
};

/**
 * Determines which API to use based on environment configuration and session status.
 * 
 * Decision logic:
 * 
 * Non-production environments (development, test, etc.):
 * - Always respect VITE_USE_MOCK_API environment variable
 * - If VITE_USE_MOCK_API='false' → use real API (ignore session)
 * - If VITE_USE_MOCK_API='true' or not set → use mock API
 * 
 * Production environment:
 * 1. If useMockAPI is true (env var) → use mock API unless user is logged in to real API
 * 2. If useMockAPI is false (env var) → use real API if user is logged in, otherwise mock
 * 3. Default → check session, use real API if logged in, otherwise mock
 * 
 * Uses cached session check to avoid unnecessary network requests.
 */
export const shouldUseMockAPI = async (): Promise<boolean> => {
  // Production environment logic with session checks
  // If explicitly set to use real API (useMockAPI === false), check session
  if (useMockAPI === false) {
    const loggedIn = await checkUserSession();
    return !loggedIn; // Use mock if not logged in
  }
  
  return useMockAPI;
};

/**
 * Debug helper to log current environment configuration
 */
export const logEnvironmentConfig = async () => {
  if (isDevelopment) {
    const shouldUseMock = await shouldUseMockAPI();
    console.group('🔧 Environment Configuration');
    console.log('Mode:', import.meta.env.MODE);
    console.log('Development:', isDevelopment);
    console.log('Production:', isProduction);
    console.log('Use Mock API (env var):', useMockAPI);
    console.log('User Logged In (cached):', getIsUserLoggedIn());
    console.log('Actually Using Mock API:', shouldUseMock);
    console.log('API Base URL:', apiBaseURL);
    console.groupEnd();
  }
};

/**
 * Helper to get environment-specific settings
 * @deprecated Consider using individual exports instead
 */
export const getEnvironmentConfig = () => ({
  isDevelopment,
  isProduction,
  useMockAPI,
  isUserLoggedIn: getIsUserLoggedIn(),
  apiBaseURL,
  mode: import.meta.env.MODE,
});