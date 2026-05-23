/**
 * Translation Module - Real API Implementation
 *
 * Defines real HTTP endpoints for translation operations.
 * Uses Core's generic APIClient for HTTP communication.
 *
 * IMPORTANT: This is feature-specific API logic. Core module does NOT know about
 * translation endpoints - the Translation module owns its own API definitions.
 */

import { apiClient, type APIResponse } from '@/modules/core';
import type { StreamJobResponse } from '../types';

export class TranslationRealAPI {

  async translateChapterStream(
    chapterId: string,
    mode: string = 'full'
  ): Promise<APIResponse<StreamJobResponse>> {
    return apiClient.post<StreamJobResponse>('/translate-chapter-stream', {
      chapterId,
      mode,
    });
  }

  async suggestGlossaryTerms(text: string): Promise<APIResponse<string[]>> {
    return apiClient.post<string[]>('/suggest-terms', { text });
  }
}
