/**
 * Share Module - Public Reader API Implementation
 * Uses raw fetch for public endpoints (no auth required).
 */
import { apiBaseURL } from '@/modules/core';
import type { SharedChapterData, SharedSeriesData } from '../types';

function publicBaseURL(): string {
  // apiBaseURL is like "http://localhost:3000/api"
  // public endpoints are at "/api/public/..."
  return apiBaseURL.replace(/\/api$/, '/api/public');
}

export async function fetchSharedChapter(uuid: string): Promise<SharedChapterData> {
  const response = await fetch(`${publicBaseURL()}/share/${uuid}`);
  if (!response.ok) throwShareError(response);
  return response.json();
}

export async function fetchSharedSeries(uuid: string): Promise<SharedSeriesData> {
  const response = await fetch(`${publicBaseURL()}/share/${uuid}/series`);
  if (!response.ok) throwShareError(response);
  return response.json();
}

export async function fetchSharedChapterInSeries(
  seriesUuid: string,
  chapterUuid: string,
): Promise<SharedChapterData> {
  const response = await fetch(
    `${publicBaseURL()}/share/${seriesUuid}/chapters/${chapterUuid}`,
  );
  if (!response.ok) throwShareError(response);
  return response.json();
}

function throwShareError(response: Response): never {
  if (response.status === 404) {
    throw new Error('Share link not found or has been revoked.');
  }
  throw new Error(`Failed to load shared content (${response.status})`);
}
