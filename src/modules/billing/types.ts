/**
 * Billing Module - Type Definitions
 *
 * Defines all types for billing and subscription functionality with dynamic features and limits
 */

export interface Plan {
  id: string;
  name: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

export interface Usage {
  [key: string]: number;
}

export interface Subscription {
  plan: Plan;
  usage: Usage;
}

export interface BillingState {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
}

// Known feature keys - backend may add more
export const FEATURE_KEYS = {
  translation: 'translation',
  seriesLimit: 'series_limit',
  chapterLimit: 'chapter_limit',
  glossaryLimit: 'glossary_limit',
} as const;

// Type for known feature keys
export type FeatureKey = typeof FEATURE_KEYS[keyof typeof FEATURE_KEYS];