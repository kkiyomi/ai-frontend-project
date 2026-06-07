/**
 * Share Module - Public Reader API Implementation
 * Uses apiClient for public endpoints (same transport as authenticated
 * calls — the backend decides auth, not the client). Includes credentials
 * so the backend can optionally detect the viewer's session for ownership
 * checks.
 */
import { apiClient, type APIResponse } from '@/modules/core';
import type { SharedChapterData, SharedSeriesData } from '../types';

export async function fetchSharedChapter(uuid: string): Promise<APIResponse<SharedChapterData>> {
  return apiClient.get<SharedChapterData>(`/public/share/${uuid}`);
}

export async function fetchSharedSeries(uuid: string): Promise<APIResponse<SharedSeriesData>> {
  return apiClient.get<SharedSeriesData>(`/public/share/${uuid}/series`);
}

export async function fetchSharedChapterInSeries(
  seriesUuid: string,
  chapterUuid: string,
): Promise<APIResponse<SharedChapterData>> {
  return apiClient.get<SharedChapterData>(
    `/public/share/${seriesUuid}/chapters/${chapterUuid}`,
  );
}
