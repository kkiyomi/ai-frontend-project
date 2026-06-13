<template>
  <div
    v-if="nextTierName"
    class="card card-bordered shadow-sm bg-base-100 p-6 space-y-6"
  >

    <!-- Title -->
    <h2 class="text-lg font-medium text-base-content">
      Upgrade to {{ nextTierName }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- Left Side -->
      <div class="space-y-4">

        <!-- Billing Period Toggle -->
        <div
          v-if="hasBothVariants"
          class="inline-flex rounded-lg border border-base-300 bg-base-200 p-0.5"
          role="radiogroup"
          aria-label="Billing period"
        >
          <button
            class="relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
            :class="showYearly ? 'text-base-content/60 hover:text-base-content/80' : 'bg-base-100 text-base-content shadow-sm'"
            :aria-pressed="!showYearly"
            @click="showYearly = false"
          >
            Monthly
          </button>
          <button
            class="relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5"
            :class="showYearly ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/60 hover:text-base-content/80'"
            :aria-pressed="showYearly"
            @click="showYearly = true"
          >
            Yearly
            <span
              v-if="savingsPercent > 0"
              class="inline-flex items-center rounded-full bg-success/15 px-1.5 py-0.5 text-[11px] font-semibold text-success leading-none"
            >
              -{{ savingsPercent }}%
            </span>
          </button>
        </div>

        <!-- Price -->
         <div class="text-4xl font-semibold text-base-content">
           ${{ formatDisplayPrice().price }}
            <span class="text-base font-normal text-base-content/70">
             per month
           </span>
         </div>
          <div class="text-sm text-base-content/70 -mt-2">
            {{ formatDisplayPrice().billingNote }}
          </div>

        <!-- Savings callout (yearly only) -->
        <div
          v-if="showYearly && savingsPercent > 0"
          class="flex items-center gap-2 text-sm text-success font-medium"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          Save {{ savingsPercent }}% with yearly billing
        </div>

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
            v-for="feat in Object.values(displayedPlan.features)"
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
            v-for="(limit, key) in displayedPlan.limits"
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
import { computed, ref } from 'vue';
import type { Plan } from '../types';

interface Props {
  /** The user's current subscription plan */
  currentPlan: Plan;
  /** All available plans (used to find next tier's monthly/yearly variants) */
  plans: Plan[];
  /** Optional: override which tier to upgrade to. When provided, skips the default
   *  "next tier by price" logic and shows this specific tier instead.
   *  Used by UpgradeModal for targeted upgrades (limit exceeded, locked feature). */
  upgradeToTierName?: string;
}

const props = defineProps<Props>();

// --- Tier grouping ---

/** Extract the canonical tier name by stripping the "(Monthly)" suffix if present. */
function getTierName(plan: Plan): string {
  return plan.name.replace(/\s*\(Monthly\)\s*$/i, '').trim();
}

/** Determine whether a plan is yearly or monthly from its period field. */
function isYearly(plan: Plan): boolean {
  return plan.period === 'yearly';
}

interface TierVariants {
  monthly: Plan | null;
  yearly: Plan | null;
}

/** Group all plans by canonical tier name. */
const planTiers = computed<Record<string, TierVariants>>(() => {
  const tiers: Record<string, TierVariants> = {};

  for (const plan of props.plans) {
    const tierName = getTierName(plan);
    if (!tiers[tierName]) {
      tiers[tierName] = { monthly: null, yearly: null };
    }
    if (isYearly(plan)) {
      tiers[tierName].yearly = plan;
    } else {
      tiers[tierName].monthly = plan;
    }
  }

  return tiers;
});

/** Tier names ordered by the minimum price among their variants (ascending). */
const orderedTierNames = computed<string[]>(() => {
  return Object.entries(planTiers.value)
    .map(([name, variants]) => ({
      name,
      minPrice: Math.min(
        variants.monthly?.price ?? Infinity,
        variants.yearly?.price ?? Infinity,
      ),
    }))
    .sort((a, b) => a.minPrice - b.minPrice)
    .map((t) => t.name);
});

/** The canonical tier name of the user's current plan. */
const currentTierName = computed<string>(() => getTierName(props.currentPlan));

/** The canonical name of the next tier above the user's current one, or null if on highest. */
const nextTierName = computed<string | null>(() => {
  // Honor explicit override (used by UpgradeModal)
  if (props.upgradeToTierName && planTiers.value[props.upgradeToTierName]) {
    return props.upgradeToTierName;
  }

  const idx = orderedTierNames.value.indexOf(currentTierName.value);
  if (idx === -1 || idx >= orderedTierNames.value.length - 1) return null;
  return orderedTierNames.value[idx + 1];
});

/** The monthly and yearly plan objects for the next tier. */
const nextTierVariants = computed<TierVariants>(() => {
  if (!nextTierName.value) return { monthly: null, yearly: null };
  return planTiers.value[nextTierName.value] ?? { monthly: null, yearly: null };
});

// --- Toggle state ---

/** Whether both monthly and yearly variants exist for the next tier. */
const hasBothVariants = computed<boolean>(
  () => nextTierVariants.value.monthly !== null && nextTierVariants.value.yearly !== null,
);

/** Toggle state: false = monthly, true = yearly. Defaults to yearly if available (to surface savings). */
const showYearly = ref<boolean>(
  nextTierVariants.value.yearly !== null,
);

/** The plan currently selected by the toggle. */
const displayedPlan = computed<Plan>(() => {
  const variants = nextTierVariants.value;
  if (showYearly.value && variants.yearly) return variants.yearly;
  if (variants.monthly) return variants.monthly;
  if (variants.yearly) return variants.yearly;
  // Should not reach here — guarded by v-if="nextTierName" in template
  throw new Error('No plan available for display');
});

// --- Savings calculation ---

/** Percentage saved when paying yearly vs monthly (0 if monthly or calculation not possible). */
const savingsPercent = computed<number>(() => {
  const variants = nextTierVariants.value;
  if (!variants.monthly || !variants.yearly) return 0;

  const monthlyAnnualCost = variants.monthly.price * 12;
  const yearlyCost = variants.yearly.price;

  if (monthlyAnnualCost <= 0 || yearlyCost >= monthlyAnnualCost) return 0;

  return Math.round(((monthlyAnnualCost - yearlyCost) / monthlyAnnualCost) * 100);
});

// --- Price formatting ---

function formatPeriodAdjective(period: string): string {
  switch (period) {
    case 'monthly': return 'monthly';
    case 'yearly': return 'yearly';
    case 'quarterly': return 'quarterly';
    case 'lifetime': return 'once for lifetime';
    default: return period;
  }
}

/** Returns the display price (normalized to per-month) and a billing note. */
function formatDisplayPrice(): { price: number; billingNote: string } {
  const plan = displayedPlan.value;
  const period = formatPeriodAdjective(plan.period);

  let price: number;
  let billingNote: string;

  if (period === 'yearly') {
    // Show monthly-equivalent price
    price = Math.round((plan.price / 12) * 100) / 100;
    billingNote = `billed yearly ($${plan.price}/yr)`;
  } else if (period === 'monthly') {
    price = plan.price;
    billingNote = 'billed monthly';
  } else {
    price = plan.price;
    billingNote = `billed ${period}`;
  }

  return { price, billingNote };
}

const goToProduct = () => {
  if (displayedPlan.value?.product_page) {
    window.open(displayedPlan.value.product_page, '_blank');
  }
};
</script>
