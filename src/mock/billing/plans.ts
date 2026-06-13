// src/mock/billing/plans.ts
// Plan definitions

import type { Plan, PlanItem, FeatureItem, LimitItem } from '@/modules/billing/types';
import {
  customThemesFeature,
  translationFeature,
  splitViewFeature,
  fullViewFeature,
  paragraphEditingFeature,
  glossaryHighlightingFeature,
  glossaryCategoriesFeature,
  glossaryPopupFeature,
  glossaryImportFeature,
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

/**
 * Build an ordered `items` array from features and limits dicts using an explicit
 * sequence order.  Items not listed in the order array are silently skipped.
 */
function buildItems(
  features: Plan['features'],
  limits: Plan['limits'],
  order: { key: string; sequence: number }[],
): PlanItem[] {
  const items: PlanItem[] = [];
  for (const { key, sequence } of order) {
    const feat = features[key];
    if (feat) {
      const item: FeatureItem = {
        type: 'feature',
        key: feat.key,
        enabled: feat.enabled,
        name: feat.name,
        description: feat.description,
        icon: feat.icon,
        category: feat.category,
        sequence,
      };
      items.push(item);
      continue;
    }
    const lim = limits[key];
    if (lim) {
      const item: LimitItem = {
        type: 'limit',
        key: lim.key,
        limitType: lim.type,
        value: lim.value,
        name: lim.name,
        description: lim.description,
        unit: lim.unit,
        icon: lim.icon,
        category: lim.category,
        resetPeriod: lim.resetPeriod,
        expiresAt: lim.expiresAt,
        sequence,
      };
      items.push(item);
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// Order definitions (mixed features + limits, controlled by sequence)
// ---------------------------------------------------------------------------

/** Shared base order for all plans. */
const baseOrder = [
  { key: 'translation',             sequence: 10 },
  { key: 'translation_tokens_limit', sequence: 20 },
  { key: 'split_view',              sequence: 30 },
  { key: 'full_view',               sequence: 40 },
  { key: 'paragraph_editing',       sequence: 50 },
  { key: 'series_limit',            sequence: 60 },
  { key: 'chapter_limit',           sequence: 70 },
  { key: 'glossary_highlighting',   sequence: 80 },
  { key: 'glossary_categories',     sequence: 90 },
  { key: 'glossary_popup',          sequence: 100 },
  { key: 'glossary_limit',          sequence: 110 },
];

/** Additional items for Pro (above Free). */
const proExtraOrder = [
  { key: 'custom_themes',    sequence: 120 },
  { key: 'glossary_import',  sequence: 130 },
  { key: 'draft_mode',       sequence: 140 },
];

/** Additional items for Team (above Pro). */
const teamExtraOrder = [
  { key: 'export_count_per_month',  sequence: 150 },
  { key: 'collaborators_limit',     sequence: 160 },
];

const freeOrder  = baseOrder;
const proOrder   = [...baseOrder, ...proExtraOrder];
const teamOrder  = [...baseOrder, ...proExtraOrder, ...teamExtraOrder];

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

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
  },
  items: [] as PlanItem[],
};
mockPlanFree.items = buildItems(mockPlanFree.features, mockPlanFree.limits, freeOrder);

export const mockPlanPro: Plan = {
  id: "pro_monthly",
  name: "Pro Plan (Monthly)",
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
  },
  items: [] as PlanItem[],
};
mockPlanPro.items = buildItems(mockPlanPro.features, mockPlanPro.limits, proOrder);

export const mockPlanProYearly: Plan = {
  id: "pro_yearly",
  name: "Pro Plan",
  price: 199.90,
  period: 'yearly',
  features: mockPlanPro.features, // same features as monthly
  limits: mockPlanPro.limits,     // same limits as monthly
  product_page: mockPlanPro.product_page,
  items: [] as PlanItem[],
};
mockPlanProYearly.items = buildItems(mockPlanProYearly.features, mockPlanProYearly.limits, proOrder);

export const mockPlanTeam: Plan = {
  id: "team_monthly",
  name: "Team Plan (Monthly)",
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
  },
  items: [] as PlanItem[],
};
mockPlanTeam.items = buildItems(mockPlanTeam.features, mockPlanTeam.limits, teamOrder);

export const mockPlanTeamYearly: Plan = {
  id: "team_yearly",
  name: "Team Plan",
  price: 499.90,
  period: 'yearly',
  features: mockPlanTeam.features,
  limits: mockPlanTeam.limits,
  product_page: mockPlanTeam.product_page,
  items: [] as PlanItem[],
};
mockPlanTeamYearly.items = buildItems(mockPlanTeamYearly.features, mockPlanTeamYearly.limits, teamOrder);

export const mockPlans: Plan[] = [ mockPlanFree, mockPlanPro, mockPlanProYearly, mockPlanTeam, mockPlanTeamYearly ];
