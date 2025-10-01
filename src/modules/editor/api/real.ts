/**
 * Editor Module - Real API Implementation
 *
 * Handles chapter CRUD operations against the real backend API.
 * Uses Core's APIClient for HTTP communication.
 *
 * Usage Example:
 * ```typescript
 * import { editorAPI } from '@/modules/editor/api';
 *
 * const response = await editorAPI.updateChapter('ch-123', {
 *   translatedContent: 'New translation'
 * });
 * ```
 */

import { apiClient, type APIResponse } from '@/modules/core';
import type { Chapter } from '../types';

export class EditorRealAPI {
  /**
   * Fetch all chapters, optionally filtered by series
   */
  async getChapters(seriesId?: string): Promise<APIResponse<Chapter[]>> {
    const endpoint = seriesId ? `/chapters?seriesId=${seriesId}` : '/chapters';
    return apiClient.get<Chapter[]>(endpoint);
  }

  /**
   * Fetch a single chapter by ID
   */
  async getChapter(chapterId: string): Promise<APIResponse<Chapter>> {
    return apiClient.get<Chapter>(`/chapters/${chapterId}`);
  }

  /**
   * Create a new chapter
   */
  async createChapter(
    title: string,
    content: string,
    seriesId: string
  ): Promise<APIResponse<Chapter>> {
    return apiClient.post<Chapter>('/chapters', {
      title,
      content,
      seriesId,
    });
  }

  /**
   * Update an existing chapter
   *
   * Example:
   * ```typescript
   * await editorAPI.updateChapter('ch-123', {
   *   originalParagraphs: ['Updated paragraph 1', 'Updated paragraph 2'],
   *   content: 'Updated paragraph 1\n\nUpdated paragraph 2'
   * });
   * ```
   */
  async updateChapter(
    chapterId: string,
    updates: Partial<Chapter>
  ): Promise<APIResponse<Chapter>> {
    return apiClient.patch<Chapter>(`/chapters/${chapterId}`, updates);
  }

  /**
   * Delete a chapter
   */
  async deleteChapter(chapterId: string): Promise<APIResponse<void>> {
    return apiClient.delete<void>(`/chapters/${chapterId}`);
  }

  /**
   * Batch update multiple chapters (useful for bulk operations)
   */
  async batchUpdateChapters(
    updates: Array<{ id: string; changes: Partial<Chapter> }>
  ): Promise<APIResponse<Chapter[]>> {
    return apiClient.post<Chapter[]>('/chapters/batch-update', { updates });
  }
}
