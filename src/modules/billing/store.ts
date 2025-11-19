/**
 * Billing Module - Pinia Store
 *
 * Manages billing and subscription state with dynamic features and limits.
 * Uses the Billing API layer which handles mock/real switching internally.
 *
 * Usage Example:
 * ```typescript
 * import { useBillingStore } from '@/modules/billing';
 *
 * const billing = useBillingStore();
 * await billing.fetchSubscription();
 * 
 * // Check limits dynamically
 * if (billing.canConsume('series_limit')) {
 *   // Create series
 * }
 * 
 * // Check features dynamically
 * if (billing.hasFeature('translation')) {
 *   // Show translation button
 * }
 * ```
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { billingAPI } from './api';
import type { Subscription, BillingState, FeatureKey } from './types';

export const useBillingStore = defineStore('billing', () => {
  // State
  const subscription = ref<Subscription | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const billingState = computed<BillingState>(() => ({
    subscription: subscription.value,
    loading: loading.value,
    error: error.value,
  }));

  const currentPlan = computed(() => subscription.value?.plan || null);
  const currentUsage = computed(() => subscription.value?.usage || null);

  // Dynamic feature checking
  const hasFeature = (feature: string): boolean => {
    if (!subscription.value?.plan) return false;
    return !!subscription.value.plan.features[feature];
  };

  // Dynamic limit checking
  const canConsume = (limitKey: string): boolean => {
    if (!subscription.value) return false;
    const { usage, plan } = subscription.value;
    
    // Check if limit exists in plan
    if (!(limitKey in plan.limits)) return true; // No limit defined means unlimited
    
    // Check if usage exists, default to 0 if not tracked yet
    const currentUsage = usage[limitKey] || 0;
    const limit = plan.limits[limitKey];
    
    return currentUsage < limit;
  };

  // Get usage percentage for any limit
  const getUsagePercentage = (limitKey: string): number => {
    if (!subscription.value) return 0;
    const { usage, plan } = subscription.value;
    
    if (!(limitKey in plan.limits)) return 0;
    
    const currentUsage = usage[limitKey] || 0;
    const limit = plan.limits[limitKey];
    
    if (limit === 0) return 100; // Avoid division by zero
    return Math.round((currentUsage / limit) * 100);
  };

  // Get remaining quota for any limit
  const getRemainingQuota = (limitKey: string): number => {
    if (!subscription.value) return 0;
    const { usage, plan } = subscription.value;
    
    if (!(limitKey in plan.limits)) return Infinity;
    
    const currentUsage = usage[limitKey] || 0;
    const limit = plan.limits[limitKey];
    
    return Math.max(0, limit - currentUsage);
  };

  // Get all available features
  const getAvailableFeatures = (): string[] => {
    if (!subscription.value?.plan) return [];
    return Object.keys(subscription.value.plan.features).filter(
      feature => subscription.value!.plan.features[feature]
    );
  };

  // Get all limits with their current usage
  const getAllLimitsWithUsage = (): Array<{
    key: string;
    limit: number;
    usage: number;
    percentage: number;
    remaining: number;
  }> => {
    if (!subscription.value) return [];
    
    const { usage, plan } = subscription.value;
    
    return Object.keys(plan.limits).map(key => ({
      key,
      limit: plan.limits[key],
      usage: usage[key] || 0,
      percentage: getUsagePercentage(key),
      remaining: getRemainingQuota(key),
    }));
  };

  // Convenience methods for known features (backward compatibility)
  const canCreateSeries = computed(() => canConsume('series_limit'));
  const canCreateChapter = computed(() => canConsume('chapter_limit'));
  const canCreateGlossaryTerm = computed(() => canConsume('glossary_limit'));
  const hasTranslationFeature = computed(() => hasFeature('translation'));

  // Convenience methods for known usage percentages (backward compatibility)
  const seriesUsagePercentage = computed(() => getUsagePercentage('series_limit'));
  const chapterUsagePercentage = computed(() => getUsagePercentage('chapter_limit'));
  const glossaryUsagePercentage = computed(() => getUsagePercentage('glossary_limit'));

  // Actions
  async function fetchSubscription() {
    loading.value = true;
    error.value = null;

    try {
      const response = await billingAPI.getSubscription();

      if (response.success && response.data) {
        subscription.value = response.data;
      } else {
        error.value = response.error || 'Failed to fetch subscription';
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  // Update usage (called when creating/deleting content)
  function updateUsage(limitKey: string, delta: number) {
    if (!subscription.value) return;

    // Initialize usage if it doesn't exist
    if (!(limitKey in subscription.value.usage)) {
      subscription.value.usage[limitKey] = 0;
    }

    subscription.value.usage[limitKey] = Math.max(0, subscription.value.usage[limitKey] + delta);
  }

  // Batch update usage
  function updateMultipleUsage(updates: Record<string, number>) {
    if (!subscription.value) return;

    Object.entries(updates).forEach(([key, delta]) => {
      updateUsage(key, delta);
    });
  }

  return {
    // State
    subscription,
    loading,
    error,
    billingState,

    // Computed
    currentPlan,
    currentUsage,

    // Dynamic methods
    hasFeature,
    canConsume,
    getUsagePercentage,
    getRemainingQuota,
    getAvailableFeatures,
    getAllLimitsWithUsage,

    // Backward compatibility computed
    canCreateSeries,
    canCreateChapter,
    canCreateGlossaryTerm,
    hasTranslationFeature,
    seriesUsagePercentage,
    chapterUsagePercentage,
    glossaryUsagePercentage,

    // Actions
    fetchSubscription,
    clearError,
    updateUsage,
    updateMultipleUsage,
  };
});