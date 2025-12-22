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
    <div v-if="subscription && currentPlan" class="space-y-6">
      <h2 class="text-lg font-medium text-gray-900">Current Subscription</h2>

      <div class="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ currentPlan.name }}
        </h3>

        <!-- Usage -->
        <div class="mt-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Usage</h4>

          <div
            v-for="limit in enhancedLimits"
            :key="limit.key"
            class="mb-5"
          >
            <div class="flex justify-between items-start text-sm mb-1">
              <div>
                <div class="text-gray-900 font-medium">{{ limit.name }}</div>
                <div v-if="limit.description" class="text-gray-500 text-xs mt-0.5">
                  {{ limit.description }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-gray-900 font-medium">
                  {{ formatUsageValue(limit.usage) }} / {{ formatLimitValue(limit.limit) }} {{ limit.unit || '' }}
                </div>
                <div class="text-gray-500 text-xs mt-0.5">
                  {{ limit.percentage }}% used
                </div>
              </div>
            </div>

            <div class="w-full h-2 bg-gray-200 rounded-lg mt-2">
              <div
                class="h-full rounded-lg"
                :class="limit.percentage >= 90 ? 'bg-red-500' : limit.percentage >= 70 ? 'bg-yellow-500' : 'bg-blue-600'"
                :style="{ width: Math.min(limit.percentage, 100) + '%' }"
              />
            </div>

            <div class="flex justify-between items-center text-xs text-gray-500 mt-1">
              <span>
                {{ formatLimitType(limit) }}
              </span>
              <span>
                Remaining: {{ formatRemaining(limit) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Card -->
    <UpgradeCard
      v-if="nextPlan && currentPlan"
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
  getAllLimitsWithUsage,
  loadPlans,
} = useBillingStore();


const currentPlan = computed(() => subscription?.plan || null);
const currentUsage = computed(() => subscription?.usage || null);

const limits = computed(() => getAllLimitsWithUsage());

const enhancedLimits = computed(() => {
  const defs = subscription?.plan.limits ?? {};
  return limits.value.map(limit => ({
    ...limit,
    type: defs[limit.key]?.type,
    resetPeriod: defs[limit.key]?.resetPeriod,
  }));
});

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
  const index = sorted.findIndex(p => p.id === currentPlan.value?.id);

  return sorted[index + 1] || null;
});

// Helper functions
function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

function formatUsageValue(value: number): string {
  return formatNumber(value);
}

function formatLimitValue(value: number): string {
  return formatNumber(value);
}

function formatRemaining(limit: any): string {
  const remaining = limit.remaining ?? 0;
  const unit = limit.unit ?? '';
  return `${formatNumber(remaining)} ${unit}`.trim();
}

function formatLimitType(limit: any): string {
  if (limit.type === 'recurring') {
    const period = limit.resetPeriod === 'monthly' ? 'monthly' : limit.resetPeriod || 'period';
    return `${period}`.charAt(0).toUpperCase() + `${period}`.slice(1);
  }
  if (limit.type === 'permanent') {
    return 'Permanent';
  }
  if (limit.type === 'topup') {
    return 'Top-up';
  }
  return '';
}

</script>
