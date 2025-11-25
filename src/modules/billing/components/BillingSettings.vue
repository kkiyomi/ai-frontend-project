<template>
  <div class="space-y-10 p-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-10 text-gray-500">
      Loading billing information...
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    >
      <p>{{ error }}</p>
      <button @click="retry" class="underline text-sm mt-2">Retry</button>
    </div>

    <!-- Subscription Details -->
    <div v-if="subscription" class="space-y-6">
      <h2 class="text-xl font-bold">Current Subscription</h2>

      <div class="border rounded-lg p-5 bg-white shadow-sm">
        <h3 class="font-semibold text-lg">{{ currentPlan.name }}</h3>

        <!-- Limits & Usage -->
        <div class="mt-6">
          <h4 class="font-semibold mb-2">Usage</h4>

          <div
            v-for="limit in limits"
            :key="limit.key"
            class="mb-4"
          >
            <div class="flex justify-between text-sm mb-1">
              <span>{{ formatLimitName(limit.key) }}</span>
              <span>
                {{ limit.usage }} / {{ limit.limit }}
                ({{ limit.percentage }}%)
              </span>
            </div>

            <div class="w-full h-2 bg-gray-200 rounded">
              <div
                class="h-full bg-blue-500 rounded"
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

    <!-- Available Plans -->
    <div v-if="plans.length" class="space-y-6">
      <h2 class="text-xl font-bold">Available Plans</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="border rounded-lg p-5 bg-white shadow-sm"
        >
          <h3 class="font-semibold text-lg mb-1">
            {{ plan.name }}
          </h3>

          <p class="text-gray-700 mb-4">
            <span v-if="plan.price === 0">Free</span>
            <span v-else>${{ plan.price }}/mo</span>
          </p>

          <!-- Features -->
          <div class="mb-4">
            <h4 class="font-semibold text-sm mb-2">Features</h4>
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
                <span v-else class="text-gray-400 mr-2">✖</span>

                <span :class="enabled ? 'text-black' : 'text-gray-500'">
                  {{ formatFeatureName(feature) }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Limits -->
          <div>
            <h4 class="font-semibold text-sm mb-2">Limits</h4>
            <ul class="text-sm space-y-1">
              <li
                v-for="(limit, key) in plan.limits"
                :key="key"
                class="flex justify-between"
              >
                <span>{{ formatLimitName(key) }}</span>
                <span>{{ limit }}</span>
              </li>
            </ul>
          </div>

          <!-- Button -->
          <button
            class="mt-4 w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
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
