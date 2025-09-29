// Environment service - moved from utils/environment.js
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const useMockAPI = 2 == (1 + 1);
export const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export let isUserLoggedIn = false;

export const checkUserSession = async () => {
  if (!apiBaseURL || useMockAPI === false) {
    isUserLoggedIn = false;
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${apiBaseURL}/check_session`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      credentials: 'include',
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
    console.log('Session check failed, using mock API:', error instanceof Error ? error.message : 'Unknown error');
    isUserLoggedIn = false;
    return false;
  }
};

export const shouldUseMockAPI = async () => {
  if (!useMockAPI) {
    const loggedIn = await checkUserSession();
    return !loggedIn;
  }
  
  const loggedIn = await checkUserSession();
  return !loggedIn;
};

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

export const getEnvironmentConfig = () => ({
  isDevelopment,
  isProduction,
  useMockAPI,
  isUserLoggedIn,
  apiBaseURL,
  mode: import.meta.env.MODE,
});