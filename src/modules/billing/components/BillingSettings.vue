<template>
  <div class="space-y-6">

    <!-- Loading -->
    <div v-if="billingStore.loading" class="text-center py-10 text-gray-500">
      Loading billing information...
    </div>

    <!-- Error -->
    <div
      v-if="billingStore.error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
    >
      <p>{{ billingStore.error }}</p>
      <button @click="retry" class="underline text-sm mt-2">Retry</button>
    </div>

    <!-- Subscription -->
    <div v-if="billingStore.subscription && currentPlan" class="space-y-6">
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

            <progress
              class="progress w-full h-2 rounded-lg mt-2"
              :class="limit.percentage >= 90 ? 'progress-error' : limit.percentage >= 70 ? 'progress-warning' : 'progress-primary'"
              :value="Math.min(limit.percentage, 100)"
              max="100"
            ></progress>

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

const billingStore = useBillingStore();

const currentPlan = computed(() => billingStore.subscription?.plan || null);
const currentUsage = computed(() => billingStore.subscription?.usage || null);

const limits = computed(() => billingStore.getAllLimitsWithUsage());

const enhancedLimits = computed(() => {
  const defs = billingStore.subscription?.plan.limits ?? {};
  return limits.value.map(limit => ({
    ...limit,
    type: defs[limit.key]?.type,
    resetPeriod: defs[limit.key]?.resetPeriod,
  }));
});

function retry() {
  billingStore.fetchSubscription();
  billingStore.loadPlans();
}

function formatFeatureName(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatLimitName(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const nextPlan = computed(() => {
  if (!currentPlan.value || !billingStore.plans.length) return null;
  const index = billingStore.plans.findIndex(p => p.id === currentPlan.value?.id);
  return billingStore.plans[index + 1] || null;
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
