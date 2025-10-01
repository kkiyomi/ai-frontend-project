/**
 * Core Module - Infrastructure Only
 *
 * IMPORTANT: This module provides ONLY generic infrastructure for HTTP communication.
 * It does NOT know about any domain concepts (Series, Glossary, Chapters, etc.)
 *
 * Core provides:
 * - APIClient: Generic HTTP client with GET/POST/PATCH/DELETE methods
 * - Environment utilities: Development vs production detection
 * - Generic types: APIResponse<T> for wrapping all API responses
 *
 * Feature modules (like Glossary) should:
 * 1. Import APIClient from Core
 * 2. Define their own domain-specific endpoints
 * 3. Handle their own mock vs real API switching
 *
 * Integration Example:
 * ```typescript
 * // In a feature module
 * import { APIClient, type APIResponse } from '@/modules/core';
 *
 * const client = new APIClient('http://api.example.com');
 * const response = await client.get<MyType>('/my-endpoint');
 * ```
 */

export { APIClient } from './services/apiClient';

export type { APIResponse } from './types';

export {
  isDevelopment,
  isProduction,
  useMockAPI,
  apiBaseURL,
  checkUserSession,
  shouldUseMockAPI,
  logEnvironmentConfig,
  getEnvironmentConfig
} from './utils/environment';
