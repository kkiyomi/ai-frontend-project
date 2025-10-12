// src/mock/index.ts
// =====================================================
// Central export point for all mock data
// Loads mock_data_* folders dynamically via utils.ts
// =====================================================

import baseSeries from './series';
import baseChapters from './chapters';
import baseGlossaryTerms from './glossaryTerms';
import { loadDynamicMockData } from './utils';
import type { Series, Chapter, GlossaryTerm } from '../types';

// =====================================================
// Load dynamic mock data (browser-safe, no Node APIs)
// =====================================================
const dynamicData = loadDynamicMockData();

// =====================================================
// Merge base and dynamic data
// =====================================================
const mockSeries: Series[] = [
  ...dynamicData.series,
  ...baseSeries,
].map(s => ({
  ...s,
  createdAt: new Date(s.createdAt),
  chapters: s.chapters || [],
}));

const mockChapters: Chapter[] = [
  ...dynamicData.chapters,
  ...baseChapters,
];
const mockGlossaryTerms: GlossaryTerm[] = [
  ...dynamicData.glossaryTerms,
  ...baseGlossaryTerms,
];

// =====================================================
// Export
// =====================================================
export default {
  mockSeries,
  mockChapters,
  mockGlossaryTerms,
};

export type { Series, Chapter, GlossaryTerm };
