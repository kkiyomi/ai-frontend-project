<!--
  UpgradeModal - Modal to prompt upgrading for a locked feature
  Uses the existing UpgradeCard component to show the next available plan.
-->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">🔒 Translation Feature Locked</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl">
          ✕
        </button>
      </div>
      <p class="text-gray-600 mb-6">
        To translate chapters, you need to upgrade to a plan that includes translation feature.
      </p>
      <UpgradeCard v-if="currentPlan && nextPlan" :currentPlan="currentPlan" :nextPlan="nextPlan" />
      <div v-else class="text-center py-8 text-gray-500">
        Loading upgrade options...
      </div>
      <button
        @click="$emit('close')"
        class="mt-6 w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        Maybe Later
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBillingStore } from '../store';
import UpgradeCard from './UpgradeCard.vue';

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

defineEmits<{
  close: [];
}>();
</script>
