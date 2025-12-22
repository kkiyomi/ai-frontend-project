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
 *
 * Automatically loads subscription and plans on store initialization.
 * Features dynamic usage updating, limit consumption tracking, and comprehensive quota management.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { billingAPI } from './api';
import { LimitCalculator } from './utils';
import type { Subscription, Plan, BillingState, FeatureKey, FeatureDefinition, Topup } from './types';

export const useBillingStore = defineStore('billing', () => {
  // State
  const subscription = ref<Subscription | null>(null);
  const plans = ref<Plan[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const showUpgradeModal = ref(false);
  const upgradeModalContext = ref<{
    featureName?: string;
    [key: string]: any;
  } | null>(null);

  // Computed
  const billingState = computed<BillingState>(() => ({
    subscription: subscription.value,
    loading: loading.value,
    error: error.value,
  }));

  const isUpgradeModalVisible = computed(() => showUpgradeModal.value);
  const currentUpgradeContext = computed(() => upgradeModalContext.value);

  const currentPlan = computed(() => subscription.value?.plan || null);
  const currentUsage = computed(() => subscription.value?.usage || null);

  // Dynamic feature checking
  const hasFeature = (feature: string): boolean => {
    if (!subscription.value?.plan) return false;
    const feat = subscription.value.plan.features[feature];
    return feat?.enabled || false;
  };

  // Dynamic limit checking with topup support
  const canConsume = (limitKey: string, amount: number = 1): boolean => {
    if (!subscription.value) return false;
    
    const limitDef = subscription.value.plan.limits[limitKey];
    if (!limitDef) return true; // No limit defined means unlimited
    
    // For recurring limits, check if we need to reset
    if (limitDef.type === 'recurring') {
      const usageRecord = subscription.value.usage[limitKey];
      if (usageRecord?.periodStart) {
        const now = new Date();
        const periodStart = new Date(usageRecord.periodStart);
        
        if (limitDef.resetPeriod === 'monthly' && 
            (now.getMonth() !== periodStart.getMonth() || 
             now.getFullYear() !== periodStart.getFullYear())) {
          // Reset usage for new month
          updateUsage(limitKey, -usageRecord.value); // Reset to zero
        }
      }
    }
    
    // Calculate total available including topups
    const totalAvailable = LimitCalculator.getTotalAvailable(subscription.value, limitKey);
    const currentUsage = subscription.value.usage[limitKey]?.value || 0;
    
    return currentUsage + amount <= totalAvailable;
  };

  // Get usage percentage for any limit
  const getUsagePercentage = (limitKey: string): number => {
    if (!subscription.value) return 0;
    
    const limitDef = subscription.value.plan.limits[limitKey];
    if (!limitDef) return 0;
    
    const totalAvailable = LimitCalculator.getTotalAvailable(subscription.value, limitKey);
    const currentUsage = subscription.value.usage[limitKey]?.value || 0;
    
    if (totalAvailable === 0) return 100;
    return Math.round((currentUsage / totalAvailable) * 100);
  };

  // Get remaining quota for any limit
  const getRemainingQuota = (limitKey: string): number => {
    if (!subscription.value) return 0;
    return LimitCalculator.getRemainingQuota(subscription.value, limitKey);
  };

  // Get information about a specific limit including topups
  const getLimitInfo = (limitKey: string) => {
    if (!subscription.value) return null;
    
    const limitDef = subscription.value.plan.limits[limitKey];
    if (!limitDef) return null;
    
    const usageRecord = subscription.value.usage[limitKey];
    const currentUsage = usageRecord?.value || 0;
    const totalAvailable = LimitCalculator.getTotalAvailable(subscription.value, limitKey);
    const remaining = getRemainingQuota(limitKey);
    
    // Get active topups for this limit
    const activeTopups = subscription.value.topups.filter(
      topup => topup.limitKey === limitKey && 
               topup.isActive && 
               new Date(topup.expiresAt) > new Date()
    );
    
    return {
      ...limitDef,
      currentUsage,
      totalAvailable,
      remaining,
      percentage: getUsagePercentage(limitKey),
      activeTopups,
      lastUpdated: usageRecord?.lastUpdated,
      periodStart: usageRecord?.periodStart,
    };
  };

  // Get all available features
  const getAvailableFeatures = (): string[] => {
    if (!subscription.value?.plan) return [];
    return Object.keys(subscription.value.plan.features).filter(
      feature => subscription.value!.plan.features[feature]?.enabled
    );
  };

  // Get all limits with their current usage and metadata
  const getAllLimitsWithUsage = (): Array<{
    key: string;
    limit: number;
    usage: number;
    percentage: number;
    remaining: number;
    name: string;
    description?: string;
    unit?: string;
    icon?: string;
    category?: string;
  }> => {
    if (!subscription.value) return [];
    
    const { plan } = subscription.value;
    
    return Object.keys(plan.limits).map(key => {
      const limitDef = plan.limits[key];
      const limitValue = limitDef.value;
      const usageRecord = subscription.value!.usage[key];
      const currentUsage = usageRecord?.value || 0;
      const remaining = getRemainingQuota(key);
      const percentage = getUsagePercentage(key);
      
      return {
        key,
        limit: limitValue,
        usage: currentUsage,
        percentage,
        remaining,
        name: limitDef.name,
        description: limitDef.description,
        unit: limitDef.unit,
        icon: limitDef.icon,
        category: limitDef.category,
      };
    }).filter(l => l.limit > 0);
  };

  // Get full feature info
  const getFeatureInfo = (featureKey: string): FeatureDefinition | null => {
    if (!subscription.value?.plan) return null;
    return subscription.value.plan.features[featureKey] || null;
  };

  // Get all enabled features with metadata
  const getEnabledFeatures = (): FeatureDefinition[] => {
    if (!subscription.value?.plan) return [];
    return Object.values(subscription.value.plan.features)
      .filter(feature => feature.enabled);
  };

  // Get features grouped by category
  const getFeaturesByCategory = (): Record<string, FeatureDefinition[]> => {
    if (!subscription.value?.plan) return {};
    const features = Object.values(subscription.value.plan.features);
    
    return features.reduce((acc, feature) => {
      const category = feature.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(feature);
      return acc;
    }, {} as Record<string, FeatureDefinition[]>);
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

  async function loadPlans() {
    loading.value = true;
    error.value = null;

    try {
      const response = await billingAPI.getPlans();

      if (response.success && response.data) {
        plans.value = response.data;
      } else {
        error.value = response.error || 'Failed to fetch plans';
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

    const limitDef = subscription.value.plan.limits[limitKey];
    const now = new Date();
    
    // Initialize usage record if it doesn't exist
    if (!subscription.value.usage[limitKey]) {
      subscription.value.usage[limitKey] = {
        value: 0,
        lastUpdated: now,
        periodStart: limitDef?.type === 'recurring' ? now : undefined,
      };
    }
    
    const usageRecord = subscription.value.usage[limitKey];
    
    // For recurring limits, check if we need to reset
    if (limitDef?.type === 'recurring' && usageRecord.periodStart) {
      const periodStart = new Date(usageRecord.periodStart);
      
      if (limitDef.resetPeriod === 'monthly' && 
          (now.getMonth() !== periodStart.getMonth() || 
           now.getFullYear() !== periodStart.getFullYear())) {
        // Reset for new period
        usageRecord.value = 0;
        usageRecord.periodStart = now;
      }
    }
    
    // Update usage value
    usageRecord.value = Math.max(0, usageRecord.value + delta);
    usageRecord.lastUpdated = now;
    
    // Consume from topups first if available
    if (delta > 0) {
      let remainingDelta = delta;
      const activeTopups = subscription.value.topups
        .filter(t => t.limitKey === limitKey && t.isActive && new Date(t.expiresAt) > now)
        .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()); // Use oldest first
      
      for (const topup of activeTopups) {
        const available = topup.amount - topup.usedAmount;
        const consumeFromTopup = Math.min(available, remainingDelta);
        
        if (consumeFromTopup > 0) {
          topup.usedAmount += consumeFromTopup;
          remainingDelta -= consumeFromTopup;
        }
        
        if (remainingDelta <= 0) break;
      }
    }
  }

  // Batch update usage
  function updateMultipleUsage(updates: Record<string, number>) {
    if (!subscription.value) return;

    Object.entries(updates).forEach(([key, delta]) => {
      updateUsage(key, delta);
    });
  }

  // Modal actions
  function openUpgradeModal(context?: { featureName?: string; limitKey?: string }) {
    upgradeModalContext.value = context || null;
    showUpgradeModal.value = true;
  }

  function openLimitUpgradeModal(limitKey: string) {
    upgradeModalContext.value = { limitKey };
    showUpgradeModal.value = true;
  }

  function closeUpgradeModal() {
    showUpgradeModal.value = false;
    // Optional: Clear context after a delay to avoid flicker
    setTimeout(() => {
      upgradeModalContext.value = null;
    }, 300);
  }

  function toggleUpgradeModal(context?: { featureName?: string; limitKey?: string }) {
    if (showUpgradeModal.value) {
      closeUpgradeModal();
    } else {
      openUpgradeModal(context);
    }
  }

  fetchSubscription()
  loadPlans()

  return {
    // State
    subscription,
    plans,
    loading,
    error,
    showUpgradeModal,
    isUpgradeModalVisible,
    currentUpgradeContext,
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
    loadPlans,
    clearError,
    updateUsage,
    updateMultipleUsage,
    openUpgradeModal,
    openLimitUpgradeModal,
    closeUpgradeModal,
    toggleUpgradeModal,
  };
});
