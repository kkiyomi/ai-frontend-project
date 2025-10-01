/**
 * Singleton API client instance
 * Used by feature modules (Editor, Glossary, etc.) to make API calls
 *
 * Example usage in a feature module:
 * ```typescript
 * import { apiClient } from '@/modules/core';
 *
 * const response = await apiClient.get<MyType>('/my-endpoint');
 * ```
 */

import { APIClient } from './apiClient';
import { apiBaseURL } from '../utils/environment';

export const apiClient = new APIClient(apiBaseURL);
