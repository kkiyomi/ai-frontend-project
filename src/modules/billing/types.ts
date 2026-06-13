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

/** A feature entry in the ordered plan items list. */
export interface FeatureItem {
  type: 'feature';
  key: string;
  enabled: boolean;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  sequence: number;
}

/** A limit entry in the ordered plan items list. */
export interface LimitItem {
  type: 'limit';
  key: string;
  limitType: LimitType;
  value: number;
  name: string;
  description?: string;
  unit?: string;
  icon?: string;
  category?: string;
  resetPeriod?: 'monthly' | 'yearly' | 'custom';
  expiresAt?: Date;
  sequence: number;
}

/** Discriminated union for ordered plan items. */
export type PlanItem = FeatureItem | LimitItem;

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly' | 'quarterly' | 'lifetime'; // Added period
  features: Record<string, FeatureDefinition>;
  limits: Record<string, LimitDefinition>; // Now has metadata
  product_page?: string;
  items: PlanItem[];         // Backend-controlled ordered list
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
  customThemes: 'custom_themes',
} as const;

// Type for known feature keys
export type FeatureKey = typeof FEATURE_KEYS[keyof typeof FEATURE_KEYS];
