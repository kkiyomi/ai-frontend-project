// Environment utilities for debugging and configuration

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const useMockAPI = import.meta.env.VITE_USE_MOCK_API === 'true';
export const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Debug helper to log current environment configuration
export const logEnvironmentConfig = () => {
  if (isDevelopment) {
    console.group('🔧 Environment Configuration');
    console.log('Mode:', import.meta.env.MODE);
    console.log('Development:', isDevelopment);
    console.log('Production:', isProduction);
    console.log('Use Mock API:', useMockAPI);
    console.log('API Base URL:', apiBaseURL);
    console.groupEnd();
  }
};

// Helper to get environment-specific settings
export const getEnvironmentConfig = () => ({
  isDevelopment,
  isProduction,
  useMockAPI,
  apiBaseURL,
  mode: import.meta.env.MODE,
});