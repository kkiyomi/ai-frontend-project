import { MockAPI } from './mockAPI';
import { RealAPI } from './realAPI';

// Environment configuration
// const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';
const USE_MOCK_API = true;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create the appropriate API instance based on environment
const createAPIService = () => {
  if (USE_MOCK_API) {
    console.log('🔧 Using mock API for development');
    return new MockAPI();
  } else {
    console.log('🌐 Using real API:', API_BASE_URL);
    return new RealAPI(API_BASE_URL);
  }
};

// Export singleton instance
export const apiService = createAPIService();

// Export configuration for debugging
export const apiConfig = {
  useMockAPI: USE_MOCK_API,
  baseURL: API_BASE_URL,
};