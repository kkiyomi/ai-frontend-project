import { MockAPI } from './mockAPI';
import { RealAPI } from './realAPI';
import { shouldUseMockAPI, isUserLoggedIn } from '../utils/environment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create the appropriate API instance based on environment
const createAPIService = async () => {
  const useMock = await shouldUseMockAPI();
  
  if (useMock) {
    console.log('🔧 Using mock API for development');
    return new MockAPI();
  } else {
    console.log('🌐 Using real API (user logged in):', API_BASE_URL);
    return new RealAPI(API_BASE_URL);
  }
};

// Create API service instance
let apiServiceInstance: MockAPI | RealAPI | null = null;

export const getAPIService = async () => {
  if (!apiServiceInstance) {
    apiServiceInstance = await createAPIService();
  }
  return apiServiceInstance;
};

// For backward compatibility, create a proxy that lazily initializes
export const apiService = new Proxy({} as MockAPI | RealAPI, {
  get(target, prop) {
    return async (...args: any[]) => {
      const service = await getAPIService();
      const method = (service as any)[prop];
      if (typeof method === 'function') {
        return method.apply(service, args);
      }
      return method;
    };
  }
});

// Export configuration for debugging
export const apiConfig = {
  isUserLoggedIn,
  baseURL: API_BASE_URL,
};