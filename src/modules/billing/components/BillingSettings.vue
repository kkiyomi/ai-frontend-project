<template>
  <div class="space-y-6">

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10 text-gray-500">
      Loading billing information...
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
    >
      <p>{{ error }}</p>
      <button @click="retry" class="underline text-sm mt-2">Retry</button>
    </div>

    <!-- Subscription -->
    <div v-if="subscription" class="space-y-6">
      <h2 class="text-lg font-medium text-gray-900">Current Subscription</h2>

      <div class="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ currentPlan.name }}
        </h3>

        <!-- Usage -->
        <div class="mt-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Usage</h4>

          <div
            v-for="limit in limits"
            :key="limit.key"
            class="mb-5"
          >
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-700">{{ formatLimitName(limit.key) }}</span>
              <span class="text-gray-700">
                {{ limit.usage }} / {{ limit.limit }} ({{ limit.percentage }}%)
              </span>
            </div>

            <div class="w-full h-2 bg-gray-200 rounded-lg">
              <div
                class="h-full bg-blue-600 rounded-lg"
                :style="{ width: limit.percentage + '%' }"
              />
            </div>

            <div class="text-xs text-gray-500 mt-1">
              Remaining: {{ limit.remaining }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Plans -->
    <div v-if="plans.length" class="space-y-6">
      <h2 class="text-lg font-medium text-gray-900">Available Plans</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ plan.name }}
          </h3>

          <p class="text-gray-700 mb-4">
            <span v-if="plan.price === 0">Free</span>
            <span v-else>${{ plan.price }}/mo</span>
          </p>

          <!-- Features -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Features</h4>
            <ul class="space-y-1 text-sm">
              <li
                v-for="(enabled, feature) in plan.features"
                :key="feature"
                class="flex items-center"
              >
                <span
                  v-if="enabled"
                  class="text-green-600 font-medium mr-2"
                >
                  ✔
                </span>
                <span
                  v-else
                  class="text-gray-400 mr-2"
                >
                  ✖
                </span>

                <span
                  :class="enabled ? 'text-gray-900' : 'text-gray-500'"
                >
                  {{ formatFeatureName(feature) }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Limits -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-2">Limits</h4>

            <ul class="text-sm space-y-1">
              <li
                v-for="(limit, key) in plan.limits"
                :key="key"
                class="flex justify-between"
              >
                <span class="text-gray-700">{{ formatLimitName(key) }}</span>
                <span class="text-gray-900">{{ limit }}</span>
              </li>
            </ul>
          </div>

          <!-- Button -->
          <button
            class="mt-4 w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            :disabled="plan.id === currentPlan.id"
          >
            <span v-if="plan.id === currentPlan.id">Current Plan</span>
            <span v-else>Choose</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Upgrade Card -->
    <UpgradeCard
      v-if="nextPlan"
      :currentPlan="currentPlan"
      :nextPlan="nextPlan"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useBillingStore } from '../store';
import UpgradeCard from './UpgradeCard.vue';

const {
  subscription,
  plans,
  loading,
  error,
  fetchSubscription,
  currentPlan,
  getAllLimitsWithUsage,
  loadPlans,
} = useBillingStore();

const limits = computed(() => getAllLimitsWithUsage());

function retry() {
  fetchSubscription();
  loadPlans();
}

function formatFeatureName(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatLimitName(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const nextPlan = computed(() => {
  if (!currentPlan || !plans.length) return null;

  const sorted = plans.sort((a, b) => (a.price || 0) - (b.price || 0));
  const index = sorted.findIndex(p => p.id === currentPlan.id);

  return sorted[index + 1] || null;
});


onMounted(() => {
  fetchSubscription();
  loadPlans();
  console.log(plans)
  console.log(subscription)
});
</script>
