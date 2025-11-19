/**
 * Billing Module - Public API
 *
 * The Billing module manages subscription plans, usage limits, and billing information.
 *
 * Features:
 * - Store: Reactive state management for subscription and usage data
 * - API: Subscription endpoint with automatic mock/real switching
 * - Usage tracking: Monitor limits for series, chapters, and glossary terms
 * - Feature flags: Check if premium features are available
 *
 * Integration Example:
 * ```typescript
 * // In main.ts - register the store
 * import { createPinia } from 'pinia';
 * const pinia = createPinia();
 * app.use(pinia);
 *
 * // In a component
 * import { useBillingStore } from '@/modules/billing';
 *
 * const billing = useBillingStore();
 * await billing.fetchSubscription();
 *
 * // Check limits before creating content
 * if (billing.canCreateSeries) {
 *   // Create series
 * } else {
 *   // Show upgrade prompt
 * }
 *
 * // Check feature availability
 * if (billing.hasTranslationFeature) {
 *   // Show translation button
 * }
 * ```
 *
 * API Configuration:
 * - Mock mode: Set VITE_USE_MOCK_API=true in .env
 * - Real mode: Set VITE_USE_MOCK_API=false and configure VITE_API_BASE_URL
 * - Billing module handles switching internally via Core's environment utils
 *
 * Usage Tracking:
 * The store provides methods to update usage counters when content is created/deleted:
 * ```typescript
 * // When creating a series
 * billing.updateUsage('series', 1);
 *
 * // When deleting a chapter
 * billing.updateUsage('chapter', -1);
 * ```
 */

// Store
export { useBillingStore } from './store';

// API
export { billingAPI } from './api';

// Types
export type {
  Plan,
  Usage,
  Subscription,
  BillingState,
} from './types';