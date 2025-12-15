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
import type { TranslationJobResponse } from '../types';

export class TranslationRealAPI {

  async translateText(
    text: string,
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> {
    return apiClient.post<string>('/translate', {
      text,
      glossaryContext
    });
  }

  async translateParagraph(
    text: string,
    chapterId: string,
    paragraphIndex: number,
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> {
    return apiClient.post<string>('/translate-paragraph', {
      text,
      chapterId,
      paragraphIndex,
      glossaryContext
    });
  }

  async translateChapter(
    chapterId: string
  ): Promise<APIResponse<{ jobId: string }>> {
    return apiClient.post<{ jobId: string }>('/translate-chapter', {
      chapterId
    });
  }

  async retranslateWithGlossary(
    originalText: string,
    currentTranslation: string,
    glossaryTerms: string[]
  ): Promise<APIResponse<string>> {
    return apiClient.post<string>('/retranslate', {
      originalText,
      currentTranslation,
      glossaryTerms
    });
  }

  async suggestGlossaryTerms(text: string): Promise<APIResponse<string[]>> {
    return apiClient.post<string[]>('/suggest-terms', { text });
  }

  async getTranslationJobStatus(
    jobId: string
  ): Promise<APIResponse<TranslationJobResponse>> {
    return apiClient.get<TranslationJobResponse>(`/translation-job/${jobId}`);
  }
}
