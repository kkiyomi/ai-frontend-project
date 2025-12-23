<template>
  <div class="border border-gray-200 rounded-lg p-6 bg-white shadow-sm space-y-6">

    <!-- Title -->
    <h2 class="text-lg font-medium text-gray-900">
      Upgrade to {{ nextPlan.name }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- Left Side -->
      <div class="space-y-4">

        <!-- Price -->
        <div class="text-4xl font-semibold text-gray-900">
          ${{ nextPlan.price }}
          <span class="text-base font-normal text-gray-500">
            per {{ formatPeriod(nextPlan.period) }}
          </span>
        </div>
        <div class="text-sm text-gray-500 -mt-2">billed {{ formatPeriodAdjective(nextPlan.period) }}</div>

        <!-- Current Plan -->
        <div class="text-sm text-gray-600">
          Your current plan:
          <span class="font-medium text-gray-900">
            {{ currentPlan.name }}
          </span>
        </div>

        <!-- Button -->
        <button
          class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Upgrade
        </button>
      </div>

      <!-- Right Side -->
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-3">Included:</h3>

        <ul class="space-y-2 text-sm">

          <!-- Features -->
          <li
            v-for="feat in Object.values(nextPlan.features)"
            :key="feat.key"
            class="flex items-start gap-2"
          >
            <span
              class="inline-flex items-center"
              :class="feat.enabled ? 'text-green-600' : 'text-gray-400'"
              aria-hidden="true"
            >
              <!-- Check icon -->
              <svg
                v-if="feat.enabled"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>

              <!-- X icon -->
              <svg
                v-else
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>

            <div class="flex-1">
              <div class="text-gray-800 font-medium">{{ feat.name }}</div>
              <div v-if="feat.description" class="text-sm text-gray-500">{{ feat.description }}</div>
            </div>
          </li>

          <!-- Limits -->
          <li
            v-for="(limit, key) in nextPlan.limits"
            :key="key"
            class="flex items-start justify-between"
          >
            <div class="flex items-start gap-2 flex-1">
              <span class="text-green-600 font-medium">
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <div class="flex-1">
                <div class="text-gray-800 font-medium">{{ limit.name }}</div>
                <div v-if="limit.description" class="text-sm text-gray-500">{{ limit.description }}</div>
              </div>
            </div>

            <div class="text-gray-800 font-medium whitespace-nowrap ml-4">
              {{ formatLimit(limit) }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBillingStore } from '../store';
import type { Plan, LimitDefinition } from '../types';

interface Props {
  currentPlan: Plan,
  nextPlan: Plan,
}

const props = defineProps<Props>();

function pretty(str: string) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatLimit(limit: LimitDefinition): string {
  if (!limit) return '';
  if (limit.unit) {
    return `${limit.value} ${limit.unit}`;
  }
  return String(limit.value);
}

function formatPeriod(period: string): string {
  switch (period) {
    case 'monthly': return 'month';
    case 'yearly': return 'year';
    case 'quarterly': return 'quarter';
    case 'lifetime': return 'lifetime';
    default: return period.replace(/ly$/, '');
  }
}

function formatPeriodAdjective(period: string): string {
  switch (period) {
    case 'monthly': return 'monthly';
    case 'yearly': return 'yearly';
    case 'quarterly': return 'quarterly';
    case 'lifetime': return 'once for lifetime';
    default: return period;
  }
}
</script>
