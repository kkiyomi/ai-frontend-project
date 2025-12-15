<!--
  UpgradeModal - Modal to prompt upgrading for a locked feature
  Uses the existing UpgradeCard component to show the next available plan.
-->
<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-lg w-full max-w-lg shadow-lg">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">🔒 Translation Feature Locked</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Description -->
      <p class="p-6 pb-4 text-gray-600">
        To translate chapters, you need to upgrade to a plan that includes translation feature.
      </p>

      <!-- Upgrade Card -->
      <div class="px-6 pb-4">
        <UpgradeCard v-if="currentPlan && nextPlan" :currentPlan="currentPlan" :nextPlan="nextPlan" />
        <div v-else class="text-center py-8 text-gray-500">
          Loading upgrade options...
        </div>
      </div>

      <!-- Maybe Later Button -->
      <div class="p-6 pt-2 border-t border-gray-200">
        <button
          @click="$emit('close')"
          class="w-full py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Maybe Later
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBillingStore } from '../store';
import UpgradeCard from './UpgradeCard.vue';

const emit = defineEmits<{
  close: [];
}>();

const billingStore = useBillingStore();

const currentPlan = computed(() => billingStore.subscription?.plan || null);

const nextPlan = computed(() => {
  if (!currentPlan.value || !billingStore.plans.length) return null;

  const sorted = [...billingStore.plans].sort((a, b) => (a.price || 0) - (b.price || 0));
  const index = sorted.findIndex(p => p.id === currentPlan.value?.id);

  // Find the next plan that includes translation feature
  for (let i = index + 1; i < sorted.length; i++) {
    if (sorted[i].features.translation) {
      return sorted[i];
    }
  }
  // If no later plan has translation, return the immediate next plan
  return sorted[index + 1] || null;
});

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close');
  }
};
</script>
