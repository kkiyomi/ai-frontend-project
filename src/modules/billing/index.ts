/**
 * Billing Module - Public API
 *
 * The Billing module manages subscription plans, usage limits, and billing information with dynamic features and limits.
 *
 * Features:
 * - Store: Reactive state management for subscription and usage data
 * - API: Subscription endpoint with automatic mock/real switching
 * - Dynamic feature checking: Check if any feature is available
 * - Dynamic usage tracking: Monitor limits for any resource type
 * - Extensible: Backend can add new features and limits without frontend changes
 *
 * Integration Example:
 * ```typescript
 * // In main.ts - register the store
 * import { createPinia } from 'pinia';
 * const pinia = createPinia();
 * app.use(pinia);
 *
 * // In a component
 * import { useBillingStore, FEATURE_KEYS } from '@/modules/billing';
 *
 * const billing = useBillingStore();
 * await billing.fetchSubscription();
 *
 * // Check limits dynamically before creating content
 * if (billing.canConsume('series_limit')) {
 *   // Create series
 * } else {
 *   // Show upgrade prompt
 * }
 *
 * // Check feature availability dynamically
 * if (billing.hasFeature(FEATURE_KEYS.translation)) {
 *   // Show translation button
 * }
 *
 * // Check any custom feature added by backend
 * if (billing.hasFeature('advanced_analytics')) {
 *   // Show analytics dashboard
 * }
 *
 * // Get usage percentage for any limit
 * const seriesUsage = billing.getUsagePercentage('series_limit');
 * const customUsage = billing.getUsagePercentage('api_calls_per_month');
 *
 * // Get all available features
 * const features = billing.getAvailableFeatures();
 * console.log('Available features:', features);
 *
 * // Get all limits with usage info
 * const limitsInfo = billing.getAllLimitsWithUsage();
 * limitsInfo.forEach(limit => {
 *   console.log(`${limit.key}: ${limit.usage}/${limit.limit} (${limit.percentage}%)`);
 * });
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
 * billing.updateUsage('series_limit', 1);
 *
 * // When deleting a chapter
 * billing.updateUsage('chapter_limit', -1);
 *
 * // Batch update multiple usage counters
 * billing.updateMultipleUsage({
 *   'series_limit': 1,
 *   'chapter_limit': 5,
 *   'api_calls_per_day': 10
 * });
 * ```
 *
 * Backward Compatibility:
 * All existing computed properties and methods are preserved for backward compatibility:
 * - canCreateSeries, canCreateChapter, canCreateGlossaryTerm
 * - hasTranslationFeature
 * - seriesUsagePercentage, chapterUsagePercentage, glossaryUsagePercentage
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
  FeatureKey,
} from './types';

// Constants
export { FEATURE_KEYS } from './types';