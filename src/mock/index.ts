// mock/index.ts
// =====================================================
// Central export point for all mock data
// =====================================================

import baseSeries from './series';
import baseChapters from './chapters';
import baseGlossaryTerms from './glossaryTerms';

// === Novel-specific mock data ===
import weirdGameSeriesData from './mock_data_Weird Game Awakening a Bug-Level Talent from the Start/series';
import weirdGameChaptersData from './mock_data_Weird Game Awakening a Bug-Level Talent from the Start/chapters';
import weirdGameGlossaryData from './mock_data_Weird Game Awakening a Bug-Level Talent from the Start/glossary';

console.log('weirdGameSeriesData')
console.log(baseSeries)
console.log(weirdGameSeriesData)
const mockSeries: Series[]  = [...baseSeries, ...weirdGameSeriesData].map(s => ({
  ...s,
  createdAt: new Date(s.createdAt), // ensure all are Date objects
  chapters: s.chapters || [],
}));
console.log(mockSeries)
const mockChapters: Chapter[]  = [...baseChapters, ...weirdGameChaptersData];
const mockGlossaryTerms: GlossaryTerm[]  = [...baseGlossaryTerms, ...weirdGameGlossaryData];

export default {
  mockSeries,
  mockChapters,
  mockGlossaryTerms,
};

// Re-export types for convenience
export type { Series, Chapter, GlossaryTerm } from '../types';