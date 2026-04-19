// src/mock/billing/plans.ts
// Plan definitions

import type { Plan } from '@/modules/billing/types';
import {
  customThemesFeature,
  translationFeature,
  prioritySupportFeature,
  splitViewFeature,
  fullViewFeature,
  paragraphEditingFeature,
  glossaryHighlightingFeature,
  glossaryCategoriesFeature,
  glossaryPopupFeature,
  glossaryImportFeature,
  settingsFeature,
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
    paragraph_editing: { ...paragraphEditingFeature, enabled: true },
    glossary_highlighting: { ...glossaryHighlightingFeature, enabled: true },
    glossary_categories: { ...glossaryCategoriesFeature, enabled: true },
    glossary_popup: { ...glossaryPopupFeature, enabled: true },
  },
  limits: {
    translation_tokens_limit: {
      ...translationTokensLimitBase,
      name: '10 ' + translationTokensLimitBase.name,
      type: 'recurring',
      value: 10
    },
    series_limit: {
      ...seriesLimitBase,
      name: '1 ' + seriesLimitBase.name,
      type: 'permanent',
      value: 1
    },
    chapter_limit: {
      ...chapterLimitBase,
      name: '200 ' + chapterLimitBase.name,
      type: 'permanent',
      value: 200
    },
    glossary_limit: {
      ...glossaryLimitBase,
      name: '250 ' + glossaryLimitBase.name,
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
    paragraph_editing: { ...paragraphEditingFeature, enabled: true },
    glossary_highlighting: { ...glossaryHighlightingFeature, enabled: true },
    glossary_categories: { ...glossaryCategoriesFeature, enabled: true },
    glossary_popup: { ...glossaryPopupFeature, enabled: true },
    glossary_import: { ...glossaryImportFeature, enabled: true },
    draft_mode: { ...draftModeFeature, enabled: true },
  },
  limits: {
    translation_tokens_limit: {
      ...translationTokensLimitBase,
      name: '1000 ' + translationTokensLimitBase.name,
      type: 'recurring',
      value: 1000
    },
    series_limit: {
      ...seriesLimitBase,
      name: '10 ' + seriesLimitBase.name,
      type: 'permanent',
      value: 10
    },
    chapter_limit: {
      ...chapterLimitBase,
      name: '2000 ' + chapterLimitBase.name,
      type: 'permanent',
      value: 2000
    },
    glossary_limit: {
      ...glossaryLimitBase,
      name: '5000 ' + glossaryLimitBase.name,
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
    paragraph_editing: { ...paragraphEditingFeature, enabled: true },
    glossary_highlighting: { ...glossaryHighlightingFeature, enabled: true },
    glossary_categories: { ...glossaryCategoriesFeature, enabled: true },
    glossary_popup: { ...glossaryPopupFeature, enabled: true },
    glossary_import: { ...glossaryImportFeature, enabled: true },
    draft_mode: { ...draftModeFeature, enabled: true },
  },
  limits: {
    translation_tokens_limit: {
      ...translationTokensLimitBase,
      name: '5000 ' + translationTokensLimitBase.name,
      type: 'recurring',
      value: 5000
    },
    series_limit: {
      ...seriesLimitBase,
      name: '50 ' + seriesLimitBase.name,
      type: 'permanent',
      value: 50
    },
    chapter_limit: {
      ...chapterLimitBase,
      name: '10000 ' + chapterLimitBase.name,
      type: 'permanent',
      value: 10000
    },
    glossary_limit: {
      ...glossaryLimitBase,
      name: '25000 ' + glossaryLimitBase.name,
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