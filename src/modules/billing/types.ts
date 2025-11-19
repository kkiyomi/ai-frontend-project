/**
 * Billing Module - Type Definitions
 *
 * Defines all types for billing and subscription functionality
 */

export interface Plan {
  id: string;
  name: string;
  features: {
    translation: boolean;
  };
  limits: {
    series_limit: number;
    chapter_limit: number;
    glossary_limit: number;
  };
}

export interface Usage {
  series_limit: number;
  chapter_limit: number;
  glossary_limit: number;
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