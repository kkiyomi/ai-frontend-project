/**
 * Share Module - Mock API Implementation
 * Provides mock data for public reader endpoints in development.
 */
import type { SharedChapterData, SharedSeriesData } from '../types';

const MOCK_CHAPTER: SharedChapterData = {
  title: 'Chapter 1: The Beginning',
  seriesName: 'Mock Series',
  content:
    '<p>This is the translated content of the first chapter. It contains rich text with HTML formatting.</p><p>The story begins here...</p>',
  rawContent:
    '<p>Ceci est le contenu original en français.</p><p>L\'histoire commence ici...</p>',
  glossary: [
    { term: 'protagonist', translation: '主人公', definition: 'The main character of the story' },
    { term: 'cultivation', translation: '修炼', definition: 'The practice of improving one\'s spiritual power' },
  ],
};

const MOCK_SERIES: SharedSeriesData = {
  seriesName: 'Mock Series',
  seriesDescription: 'An epic tale of adventure and cultivation.',
  chapters: [
    { uuid: 'abc001', name: 'Chapter 1: The Beginning', sequence: 1, hasPublishedContent: true },
    { uuid: 'abc002', name: 'Chapter 2: The Journey', sequence: 2, hasPublishedContent: true },
    { uuid: 'abc003', name: 'Chapter 3: The Battle', sequence: 3, hasPublishedContent: false },
  ],
};

export async function fetchSharedChapter(_uuid: string): Promise<SharedChapterData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ...MOCK_CHAPTER };
}

export async function fetchSharedSeries(_uuid: string): Promise<SharedSeriesData> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ...MOCK_SERIES };
}
