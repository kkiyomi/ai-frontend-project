/**
 * Editor Module - API Entry Point
 *
 * Automatically selects between mock and real API based on Core environment config.
 *
 * Switching Modes:
 * - Mock API: Set useMockAPI = true in @/modules/core/utils/environment.ts
 * - Real API: Set useMockAPI = false and configure VITE_API_BASE_URL in .env
 *
 * Usage in components:
 * ```typescript
 * import { editorAPI } from '@/modules/editor';
 *
 * const response = await editorAPI.getChapters('series-123');
 * if (response.success) {
 *   console.log('Chapters:', response.data);
 * }
 * ```
 */

import { useMockAPI } from '@/modules/core';
import { editorMockAPI } from './mock';
import { editorRealAPI } from './real';

// Export the appropriate API based on environment configuration
// The Core module's environment utils determine which API to use
export const editorAPI = useMockAPI ? editorMockAPI : editorRealAPI;

export type { EditorRealAPI } from './real';
export type { EditorMockAPI } from './mock';
