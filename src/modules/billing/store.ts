/**
 * Billing Module - Pinia Store
 *
 * Manages billing and subscription state.
 * Uses the Billing API layer which handles mock/real switching internally.
 *
 * Usage Example:
 * ```typescript
 * import { useBillingStore } from '@/modules/billing';
 *
 * const billing = useBillingStore();
 * await billing.fetchSubscription();
 * 
 * // Check limits
 * if (billing.canCreateSeries) {
 *   // Create series
 * }
 * ```
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { billingAPI } from './api';
import type { Subscription, BillingState } from './types';

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

  // Limit checks
  const canCreateSeries = computed(() => {
    if (!subscription.value) return false;
    const { usage, plan } = subscription.value;
    return usage.series_limit < plan.limits.series_limit;
  });

  const canCreateChapter = computed(() => {
    if (!subscription.value) return false;
    const { usage, plan } = subscription.value;
    return usage.chapter_limit < plan.limits.chapter_limit;
  });

  const canCreateGlossaryTerm = computed(() => {
    if (!subscription.value) return false;
    const { usage, plan } = subscription.value;
    return usage.glossary_limit < plan.limits.glossary_limit;
  });

  const hasTranslationFeature = computed(() => {
    return subscription.value?.plan.features.translation || false;
  });

  // Usage percentages
  const seriesUsagePercentage = computed(() => {
    if (!subscription.value) return 0;
    const { usage, plan } = subscription.value;
    return Math.round((usage.series_limit / plan.limits.series_limit) * 100);
  });

  const chapterUsagePercentage = computed(() => {
    if (!subscription.value) return 0;
    const { usage, plan } = subscription.value;
    return Math.round((usage.chapter_limit / plan.limits.chapter_limit) * 100);
  });

  const glossaryUsagePercentage = computed(() => {
    if (!subscription.value) return 0;
    const { usage, plan } = subscription.value;
    return Math.round((usage.glossary_limit / plan.limits.glossary_limit) * 100);
  });

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
  function updateUsage(type: 'series' | 'chapter' | 'glossary', delta: number) {
    if (!subscription.value) return;

    switch (type) {
      case 'series':
        subscription.value.usage.series_limit = Math.max(0, subscription.value.usage.series_limit + delta);
        break;
      case 'chapter':
        subscription.value.usage.chapter_limit = Math.max(0, subscription.value.usage.chapter_limit + delta);
        break;
      case 'glossary':
        subscription.value.usage.glossary_limit = Math.max(0, subscription.value.usage.glossary_limit + delta);
        break;
    }
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
  };
});