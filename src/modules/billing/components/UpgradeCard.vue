<template>
  <div class="card card-bordered shadow-sm bg-base-100 p-6 space-y-6">

    <!-- Title -->
    <h2 class="text-lg font-medium text-base-content">
      Upgrade to {{ nextPlan.name }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- Left Side -->
      <div class="space-y-4">

        <!-- Price -->
         <div class="text-4xl font-semibold text-base-content">
          ${{ formatNextPlan().price }}
           <span class="text-base font-normal text-base-content/70">
            per month
          </span>
        </div>
         <div class="text-sm text-base-content/70 -mt-2">billed {{ formatNextPlan().period }}</div>

        <!-- Current Plan -->
         <div class="text-sm text-base-content/80">
          Your current plan:
           <span class="font-medium text-base-content">
            {{ currentPlan.name }}
          </span>
        </div>

        <!-- Button -->
        <button
          class="w-full py-2 btn btn-primary"
          @click="goToProduct"
        >
          Upgrade
        </button>
      </div>

      <!-- Right Side -->
      <div>
         <h3 class="text-sm font-medium text-base-content mb-3">Included:</h3>

        <ul class="space-y-2 text-sm">

          <!-- Features -->
          <li
            v-for="feat in Object.values(nextPlan.features)"
            :key="feat.key"
            class="flex items-start gap-2"
          >
            <span
              class="inline-flex items-center"
               :class="feat.enabled ? 'text-success' : 'text-base-content/30'"
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
               <div class="text-base-content font-medium">{{ feat.name }}</div>
               <div v-if="feat.description" class="text-sm text-base-content/70">{{ feat.description }}</div>
            </div>
          </li>

          <!-- Limits -->
          <li
            v-for="(limit, key) in nextPlan.limits"
            :key="key"
            class="flex items-start justify-between"
          >
            <div class="flex items-start gap-2 flex-1">
               <span class="text-success font-medium">
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
                 <div class="text-base-content font-medium">{{ limit.name }}</div>
                 <div v-if="limit.description" class="text-sm text-base-content/70">{{ limit.description }}</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Plan } from '../types';

interface Props {
  currentPlan: Plan,
  nextPlan: Plan,
}

const props = defineProps<Props>();

function formatPeriodAdjective(period: string): string {
  switch (period) {
    case 'monthly': return 'monthly';
    case 'yearly': return 'yearly';
    case 'quarterly': return 'quarterly';
    case 'lifetime': return 'once for lifetime';
    default: return period;
  }
}

function formatNextPlan(): { price: number; period: string } {
  const nextPlan = props.nextPlan
  const period = formatPeriodAdjective(nextPlan.period)
  return {
    price: period == 'monthly' ? nextPlan.price : (nextPlan.price / 12),
    period
  }
}

const goToProduct = () => {
  if (props.nextPlan?.product_page) {
    window.open(props.nextPlan.product_page, '_blank')
  }
}
</script>
