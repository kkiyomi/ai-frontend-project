// src/mock/utils.ts
// =====================================================
// Browser-safe utility for dynamically loading mock_data_* folders
// Uses Vite's import.meta.glob (no Node APIs)
// =====================================================

import type { Series, Chapter, GlossaryTerm } from '../types';

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
    .flatMap((m: any) => m.default || []);

  const chapters: Chapter[] = Object.values(chaptersModules)
    .flatMap((m: any) => m.default || []);

  const glossaryTerms: GlossaryTerm[] = Object.values(glossaryModules)
    .flatMap((m: any) => m.default || []);

  console.log(`✅ Loaded dynamic mock data: ${series.length} series, ${chapters.length} chapters, ${glossaryTerms.length} glossary terms.`);

  return { series, chapters, glossaryTerms };
}
