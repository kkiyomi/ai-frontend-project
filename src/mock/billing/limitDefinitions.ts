// src/mock/billing/limitDefinitions.ts
// Base limit definition templates

import type { LimitDefinition } from '@/modules/billing/types';

export const translationTokensLimitBase: Omit<LimitDefinition, 'value' | 'type'> = {
  key: 'translation_tokens_limit',
  name: 'Monthly Translation Tokens',
  description: 'AI translation tokens available this month',
  unit: 'tokens',
  icon: 'translate',
  category: 'translation',
  resetPeriod: 'monthly'
};

export const seriesLimitBase: Omit<LimitDefinition, 'value' | 'type'> = {
  key: 'series_limit',
  name: 'Series Limit',
  description: 'Maximum number of series you can create',
  unit: 'series',
  icon: 'folder',
  category: 'content'
};

export const chapterLimitBase: Omit<LimitDefinition, 'value' | 'type'> = {
  key: 'chapter_limit',
  name: 'Chapter Limit',
  description: 'Maximum number of chapters you can create',
  unit: 'chapters',
  icon: 'file-text',
  category: 'content'
};

export const glossaryLimitBase: Omit<LimitDefinition, 'value' | 'type'> = {
  key: 'glossary_limit',
  name: 'Glossary Limit',
  description: 'Maximum number of glossary terms',
  unit: 'terms',
  icon: 'book',
  category: 'glossary'
};

export const exportCountPerMonthBase: Omit<LimitDefinition, 'value' | 'type'> = {
  key: 'export_count_per_month',
  name: 'Monthly Exports',
  description: 'Number of exports allowed per month',
  unit: 'exports',
  icon: 'download',
  category: 'export',
  resetPeriod: 'monthly'
};

export const collaboratorsLimitBase: Omit<LimitDefinition, 'value' | 'type'> = {
  key: 'collaborators_limit',
  name: 'Collaborators Limit',
  description: 'Maximum number of collaborators',
  unit: 'collaborators',
  icon: 'users',
  category: 'collaboration'
};