<template>
  <div class="border rounded-xl p-6 bg-[#1b1b1d] text-white flex flex-col md:flex-row gap-10">
    <!-- Left Panel -->
    <div class="flex-1 space-y-6">
      <div>
        <h2 class="text-2xl font-bold">Upgrade to {{ nextPlan.name }}</h2>
      </div>

      <!-- Pricing -->
      <div class="text-5xl font-semibold">
        ${{ nextPlan.price }}
        <span class="text-lg font-normal text-gray-300">per month</span>
      </div>
      <div class="text-sm text-gray-400 -mt-4">billed monthly</div>

      <div class="text-sm text-gray-400">
        Your current plan: <span class="text-white font-medium">{{ currentPlan.name }}</span>
      </div>

      <button
        class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium mt-2"
      >
        Upgrade
      </button>
    </div>

    <!-- Right Panel -->
    <div class="flex-1">
      <h3 class="text-lg font-semibold mb-4">You get:</h3>
      <ul class="space-y-2 text-sm">
        <li
          v-for="(enabled, feature) in nextPlan.features"
          :key="feature"
          class="flex items-start gap-2"
        >
          <span class="text-green-400 font-bold text-xl leading-none">✔</span>
          <span class="text-gray-200">
            {{ pretty(feature) }}
          </span>
        </li>

        <!-- Limits -->
        <li
          v-for="(limit, key) in nextPlan.limits"
          :key="key + '-limit'"
          class="flex justify-between gap-2"
        >
        <span class="flex gap-2">
          <span class="text-green-400 font-bold text-xl leading-none">✔</span>
          <span class="text-gray-200">
            {{ pretty(key) }}:
          </span>
        </span>
          <span class="text-gray-200">
            {{ limit }}
          </span>
        </li>
      </ul>
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
