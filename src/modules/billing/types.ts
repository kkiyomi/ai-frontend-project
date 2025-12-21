/**
 * Billing Module - Type Definitions
 *
 * Defines all types for billing and subscription functionality with dynamic features and limits
 */

export type LimitType = 'permanent' | 'recurring' | 'topup';

export interface FeatureDefinition {
  key: string;
  enabled: boolean;
  name: string;        // Human-readable name
  description?: string;
  icon?: string;       // Optional icon identifier
  category?: string;   // For grouping features in UI
}

export interface LimitDefinition {
  key: string;
  type: LimitType;           // 'permanent', 'recurring', or 'topup'
  value: number;
  name: string;
  description?: string;
  unit?: string;
  icon?: string;
  category?: string;
  resetPeriod?: 'monthly' | 'yearly' | 'custom'; // For recurring limits
  expiresAt?: Date;          // For topups
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: Record<string, FeatureDefinition>;
  limits: Record<string, LimitDefinition>; // Now has metadata
}

export interface UsageRecord {
  value: number;
  lastUpdated: Date;
  periodStart?: Date;        // For recurring limits
}

export interface Usage {
  [key: string]: UsageRecord; // Changed from simple number to record
}

export interface Topup {
  id: string;
  limitKey: string;
  amount: number;
  usedAmount: number;
  purchasedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface Subscription {
  plan: Plan;
  usage: Usage;
  topups: Topup[];          // One-time purchases
  currentPeriod: {
    start: Date;
    end: Date;
  };
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
