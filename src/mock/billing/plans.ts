// src/mock/billing/plans.ts
// Plan definitions

import type { Plan } from '@/modules/billing/types';
import {
  customThemesFeature,
  translationFeature,
  collaborationFeature,
  prioritySupportFeature,
  advancedGlossaryFeature,
  bulkOperationsFeature,
  exportFormatsFeature,
  splitViewFeature,
  fullViewFeature,
  contentFilteringFeature,
  paragraphEditingFeature,
  glossaryHighlightingFeature,
  glossaryCategoriesFeature,
  glossaryPopupFeature,
  glossaryImportFeature,
  glossarySuggestionsFeature,
  fileImportFeature,
  virtualScrollingFeature,
  settingsFeature,
  autoSaveFeature,
  draftModeFeature
} from './featureDefinitions';
import {
  translationTokensLimitBase,
  seriesLimitBase,
  chapterLimitBase,
  glossaryLimitBase,
  exportCountPerMonthBase,
  collaboratorsLimitBase
} from './limitDefinitions';

export const mockPlanFree: Plan = {
  id: "free",
  name: "Free Plan",
  price: 0,
  period: 'monthly',
  features: {
    translation: { ...translationFeature, enabled: true },
    split_view: { ...splitViewFeature, enabled: true },
    full_view: { ...fullViewFeature, enabled: true },
    content_filtering: { ...contentFilteringFeature, enabled: true },
    paragraph_editing: { ...paragraphEditingFeature, enabled: true },
    glossary_highlighting: { ...glossaryHighlightingFeature, enabled: true },
    glossary_categories: { ...glossaryCategoriesFeature, enabled: true },
    glossary_popup: { ...glossaryPopupFeature, enabled: true },
    virtual_scrolling: { ...virtualScrollingFeature, enabled: true },
    settings: { ...settingsFeature, enabled: true },
  },
  limits: {
    translation_tokens_limit: {
      ...translationTokensLimitBase,
      type: 'recurring',
      value: 10
    },
    series_limit: {
      ...seriesLimitBase,
      type: 'permanent',
      value: 1
    },
    chapter_limit: {
      ...chapterLimitBase,
      type: 'permanent',
      value: 200
    },
    glossary_limit: {
      ...glossaryLimitBase,
      type: 'permanent',
      value: 250
    },
  }
};

export const mockPlanPro: Plan = {
  id: "pro",
  name: "Pro Plan",
  price: 19.99,
  period: 'monthly',
  features: {
    translation: { ...translationFeature, enabled: true },
    custom_themes: { ...customThemesFeature, enabled: true },
    split_view: { ...splitViewFeature, enabled: true },
    full_view: { ...fullViewFeature, enabled: true },
    content_filtering: { ...contentFilteringFeature, enabled: true },
    paragraph_editing: { ...paragraphEditingFeature, enabled: true },
    glossary_highlighting: { ...glossaryHighlightingFeature, enabled: true },
    glossary_categories: { ...glossaryCategoriesFeature, enabled: true },
    glossary_popup: { ...glossaryPopupFeature, enabled: true },
    virtual_scrolling: { ...virtualScrollingFeature, enabled: true },
    settings: { ...settingsFeature, enabled: true },
    export_formats: { ...exportFormatsFeature, enabled: true },
    glossary_import: { ...glossaryImportFeature, enabled: true },
    glossary_suggestions: { ...glossarySuggestionsFeature, enabled: true },
    file_import: { ...fileImportFeature, enabled: true },
    auto_save: { ...autoSaveFeature, enabled: true },
    draft_mode: { ...draftModeFeature, enabled: true },
    collaboration: { ...collaborationFeature, enabled: false },
    priority_support: { ...prioritySupportFeature, enabled: true },
  },
  limits: {
    translation_tokens_limit: {
      ...translationTokensLimitBase,
      type: 'recurring',
      value: 1000
    },
    series_limit: {
      ...seriesLimitBase,
      type: 'permanent',
      value: 10
    },
    chapter_limit: {
      ...chapterLimitBase,
      type: 'permanent',
      value: 2000
    },
    glossary_limit: {
      ...glossaryLimitBase,
      type: 'permanent',
      value: 5000
    },
  }
};

export const mockPlanTeam: Plan = {
  id: "team",
  name: "Team Plan",
  price: 49.99,
  period: 'monthly',
  features: {
    translation: { ...translationFeature, enabled: true },
    custom_themes: { ...customThemesFeature, enabled: true },
    split_view: { ...splitViewFeature, enabled: true },
    full_view: { ...fullViewFeature, enabled: true },
    content_filtering: { ...contentFilteringFeature, enabled: true },
    paragraph_editing: { ...paragraphEditingFeature, enabled: true },
    glossary_highlighting: { ...glossaryHighlightingFeature, enabled: true },
    glossary_categories: { ...glossaryCategoriesFeature, enabled: true },
    glossary_popup: { ...glossaryPopupFeature, enabled: true },
    virtual_scrolling: { ...virtualScrollingFeature, enabled: true },
    settings: { ...settingsFeature, enabled: true },
    export_formats: { ...exportFormatsFeature, enabled: true },
    glossary_import: { ...glossaryImportFeature, enabled: true },
    glossary_suggestions: { ...glossarySuggestionsFeature, enabled: true },
    file_import: { ...fileImportFeature, enabled: true },
    auto_save: { ...autoSaveFeature, enabled: true },
    draft_mode: { ...draftModeFeature, enabled: true },
    advanced_glossary: { ...advancedGlossaryFeature, enabled: true },
    bulk_operations: { ...bulkOperationsFeature, enabled: true },
    collaboration: { ...collaborationFeature, enabled: true },
    priority_support: { ...prioritySupportFeature, enabled: true },
  },
  limits: {
    translation_tokens_limit: {
      ...translationTokensLimitBase,
      type: 'recurring',
      value: 5000
    },
    series_limit: {
      ...seriesLimitBase,
      type: 'permanent',
      value: 50
    },
    chapter_limit: {
      ...chapterLimitBase,
      type: 'permanent',
      value: 10000
    },
    glossary_limit: {
      ...glossaryLimitBase,
      type: 'permanent',
      value: 25000
    },
    export_count_per_month: {
      ...exportCountPerMonthBase,
      type: 'recurring',
      value: 200
    },
    collaborators_limit: {
      ...collaboratorsLimitBase,
      type: 'permanent',
      value: 10
    },
  }
};

export const mockPlans: Plan[] = [ mockPlanFree, mockPlanPro, mockPlanTeam ];