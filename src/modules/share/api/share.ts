/**
 * Share Module - Public Reader API Implementation
 * Uses raw fetch for public endpoints. Includes credentials so the
 * backend can optionally detect the viewer's session for ownership checks.
 */
import { apiBaseURL } from '@/modules/core';
import type { SharedChapterData, SharedSeriesData } from '../types';

function publicBaseURL(): string {
  return apiBaseURL.replace(/\/api$/, '/api/public');
}

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Share link not found or has been revoked.');
    }
    throw new Error(`Failed to load shared content (${response.status})`);
  }
  return response.json();
}

export async function fetchSharedChapter(uuid: string): Promise<SharedChapterData> {
  return fetchJSON<SharedChapterData>(`${publicBaseURL()}/share/${uuid}`);
}

export async function fetchSharedSeries(uuid: string): Promise<SharedSeriesData> {
  return fetchJSON<SharedSeriesData>(`${publicBaseURL()}/share/${uuid}/series`);
}

export async function fetchSharedChapterInSeries(
  seriesUuid: string,
  chapterUuid: string,
): Promise<SharedChapterData> {
  return fetchJSON<SharedChapterData>(
    `${publicBaseURL()}/share/${seriesUuid}/chapters/${chapterUuid}`,
  );
}
