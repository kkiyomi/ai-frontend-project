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
            per month
          </span>
        </div>
        <div class="text-sm text-gray-500 -mt-2">billed monthly</div>

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
            <span :class="feat.enabled ? 'text-green-600 font-medium' : 'text-gray-400'">
              {{ feat.enabled ? '✔' : '✗' }}
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
            class="flex justify-between items-start"
          >
            <div class="flex items-start gap-2">
              <span class="text-green-600 font-medium">✔</span>
              <span class="text-gray-800">
                {{ pretty(key) }}
              </span>
            </div>

            <span class="text-gray-800">
              {{ limit }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBillingStore } from '../store';
import type { Plan } from '../types';

interface Props {
  currentPlan: Plan,
  nextPlan: Plan,
}

const props = defineProps<Props>();

function pretty(str: string) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
</script>
