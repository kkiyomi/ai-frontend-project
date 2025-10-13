// src/mock/utils.ts
// =====================================================
// Browser-safe utility for dynamically loading mock_data_* folders
// =====================================================

import type { Series, Chapter, GlossaryTerm } from '../types';

const splitIntoParagraphs = (text: string): string[] => {
  return text
    .split(/\r?\n+/) // split by blank lines or line breaks
    .map(p => p.trim());
};

/**
 * Helper — ensures a Chapter becomes a ChapterWithParagraphs
 */
const mapChapterWithParagraphs = (chapter: Omit<Chapter, 'originalParagraphs' | 'translatedParagraphs'>): Chapter => {
  return {
    ...chapter,
    originalParagraphs: splitIntoParagraphs(chapter.content || ""),
    translatedParagraphs: splitIntoParagraphs(chapter.translatedContent || "")
  };
};

/**
 * Loads all mock_data_* modules dynamically using Vite's import.meta.glob.
 * This runs in the browser and automatically includes any new mock_data_* folders.
 */
export function loadDynamicMockData(): {
  series: Series[];
  chapters: Chapter[];
  glossaryTerms: GlossaryTerm[];
} {
  // Vite scans and eagerly imports all matching files
  const seriesModules = import.meta.glob('./mock_data_*/series.{ts,js}', { eager: true });
  const chaptersModules = import.meta.glob('./mock_data_*/chapters.{ts,js}', { eager: true });
  const glossaryModules = import.meta.glob('./mock_data_*/glossary.{ts,js}', { eager: true });

  const series: Series[] = Object.values(seriesModules)
    .flatMap((m: any) => m.mockSeries || []);

  const chapters: Chapter[] = Object.values(chaptersModules)
    .flatMap((m: any) => m.mockChapters.map(mapChapterWithParagraphs) || []);

  const glossaryTerms: GlossaryTerm[] = Object.values(glossaryModules)
    .flatMap((m: any) => m.mockGlossary || []);

  console.log(`✅ Loaded dynamic mock data: ${series.length} series, ${chapters.length} chapters, ${glossaryTerms.length} glossary terms.`);

  return { series, chapters, glossaryTerms };
}
