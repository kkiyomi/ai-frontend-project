// Core environment utilities - shared across all modules

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const useMockAPI = 2 == (1 + 1);
export const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const isMockMode = (): boolean => {
  return useMockAPI || isDevelopment;
};
export let isUserLoggedIn = false;

// Check if user is logged in to the real API
export const checkUserSession = async (): Promise<boolean> => {
  if (!apiBaseURL || useMockAPI === false) {
    isUserLoggedIn = false;
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${apiBaseURL}/check_session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      credentials: 'include', // Include cookies for session
    });

    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      isUserLoggedIn = data.authenticated === true;
      return isUserLoggedIn;
    } else {
      isUserLoggedIn = false;
      return false;
    }
  } catch (error) {
    // Timeout, network error, or other issues
    console.log('Session check failed, using mock API:', error instanceof Error ? error.message : 'Unknown error');
    isUserLoggedIn = false;
    return false;
  }
};

// Determine which API to use based on session status
export const shouldUseMockAPI = async (): Promise<boolean> => {
  if (!useMockAPI) {
    // If explicitly set to use real API, check session
    const loggedIn = await checkUserSession();
    return !loggedIn; // Use mock if not logged in
  }
  
  // If useMockAPI is true, still check if user is logged in to real API
  const loggedIn = await checkUserSession();
  return !loggedIn; // Use real API if logged in, otherwise mock
};

// Debug helper to log current environment configuration
export const logEnvironmentConfig = async () => {
  if (isDevelopment) {
    const shouldUseMock = await shouldUseMockAPI();
    console.group('🔧 Environment Configuration');
    console.log('Mode:', import.meta.env.MODE);
    console.log('Development:', isDevelopment);
    console.log('Production:', isProduction);
    console.log('Use Mock API (env):', useMockAPI);
    console.log('User Logged In:', isUserLoggedIn);
    console.log('Actually Using Mock API:', shouldUseMock);
    console.log('API Base URL:', apiBaseURL);
    console.groupEnd();
  }
};

// Helper to get environment-specific settings
export const getEnvironmentConfig = () => ({
  isDevelopment,
  isProduction,
  useMockAPI,
  isUserLoggedIn,
  apiBaseURL,
  mode: import.meta.env.MODE,
});