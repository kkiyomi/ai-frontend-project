<!--
  UpgradeModal - Modal to prompt upgrading for a locked feature
  Uses the existing UpgradeCard component to show the next available plan.
-->
<template>
  <div
    v-if="billingStore.isUpgradeModalVisible"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-lg w-full max-w-5xl h-[80vh] mx-4 flex overflow-auto" @click.stop>
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">🔒 {{ titleText }}</h2>
          <button
            @click="billingStore.closeUpgradeModal()"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Description -->
        <p class="p-6 pb-4 text-gray-600">
          {{ descriptionText }}
        </p>

        <!-- Upgrade Card -->
        <div class="px-6 pb-4">
          <UpgradeCard v-if="currentPlan && nextPlan" :currentPlan="currentPlan" :nextPlan="nextPlan" />
          <div v-else class="text-center py-8 text-gray-500">
            No upgrade option available...
          </div>
        </div>

        <!-- Maybe Later Button -->
        <div class="p-6 pt-2 border-t border-gray-200">
          <button
            @click="billingStore.closeUpgradeModal()"
            class="w-full py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBillingStore } from '../store';
import UpgradeCard from './UpgradeCard.vue';

const billingStore = useBillingStore();

const featureName = computed(() => billingStore.currentUpgradeContext?.featureName || '');
const limitKey = computed(() => billingStore.currentUpgradeContext?.limitKey || '');
const currentPlan = computed(() => billingStore.subscription?.plan || null);

const isLimit = computed(() => !!limitKey.value);

const humanize = (key: string) => {
  // Replace underscores with spaces, capitalize first letters
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const titleText = computed(() => {
  if (isLimit.value) {
    return `${humanize(limitKey.value)} Reached`;
  }
  if (featureName.value) {
    return `${humanize(featureName.value)} Feature Locked`;
  }
  return 'Feature Locked';
});

const descriptionText = computed(() => {
  if (isLimit.value) {
    return `You've reached your ${humanize(limitKey.value).toLowerCase()}. Upgrade to a plan with higher ${humanize(limitKey.value).toLowerCase()}.`;
  }
  return `To use ${humanize(featureName.value) || 'this feature'}, you need to upgrade to a plan that includes it.`;
});

const nextPlan = computed(() => {
  if (!currentPlan.value || !billingStore.plans.length) return null;

  const sorted = [...billingStore.plans].sort((a, b) => (a.price || 0) - (b.price || 0));
  const index = sorted.findIndex(p => p.id === currentPlan.value?.id);

  // For limit upgrades, find next plan with higher limit for that key
  if (isLimit.value) {
    const currentLimitObj = currentPlan.value.limits[limitKey.value];
    const currentLimit = currentLimitObj?.value ?? 0;
    for (let i = index + 1; i < sorted.length; i++) {
      const plan = sorted[i];
      const planLimitObj = plan.limits[limitKey.value];
      const planLimit = planLimitObj?.value ?? 0;
      if (planLimit > currentLimit) {
        return plan;
      }
    }
    return null;
  }

  // For feature upgrades, find next plan that includes the required feature
  for (let i = index + 1; i < sorted.length; i++) {
    const plan = sorted[i];
    // If a specific feature is requested, only accept plans that include it
    if (featureName.value) {
      const feat = plan.features[featureName.value];
      if (!feat || !feat.enabled) continue;
    }
    return plan;
  }
  // If no later plan has the required feature, return null
  return null;
});

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    billingStore.closeUpgradeModal();
  }
};
</script>
