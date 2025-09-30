/**
 * Core Module - Public API
 *
 * Provides shared infrastructure for all feature modules:
 * - API communication (mock/real switching, caching, deduplication)
 * - Common types
 * - Environment utilities
 *
 * Integration Guide:
 * ```typescript
 * import { useAPI, type APIResponse } from '@/modules/core';
 *
 * const { getGlossaryTerms, createGlossaryTerm } = useAPI();
 * ```
 */

export { useAPI, useDataAPI } from './composables/useAPI';

export { apiService } from './services/apiService';
export { APIClient } from './services/apiClient';
export { MockAPI } from './services/mockAPI';
export { RealAPI } from './services/realAPI';

export type { APIResponse, Series, Chapter, TranslationState } from './types';
export type {
  ShareRequest,
  ShareResponse,
  SharedContent,
  SharedChapter,
  ShareStats
} from './types/sharing';

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
