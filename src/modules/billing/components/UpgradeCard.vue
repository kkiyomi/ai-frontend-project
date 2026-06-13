<template>
  <div v-if="upgradeTierNames.length > 0" class="space-y-6">

    <!-- Section header -->
    <h2 class="text-lg font-medium text-base-content">Upgrade Your Plan</h2>

    <!-- One card per upgrade tier -->
    <div
      v-for="tierName in upgradeTierNames"
      :key="tierName"
      class="card card-bordered shadow-sm bg-base-100 p-6"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <!-- Left Side -->
        <div class="space-y-4">

          <!-- Tier Name -->
          <h3 class="text-base font-semibold text-base-content">
            {{ tierName }}
          </h3>

          <!-- Billing Period Toggle -->
          <div
            v-if="hasBothVariants(tierName)"
            class="inline-flex rounded-lg border border-base-300 bg-base-200 p-0.5"
            role="radiogroup"
            :aria-label="`Billing period for ${tierName}`"
          >
            <button
              class="relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
              :class="isYearlySelected(tierName) ? 'text-base-content/60 hover:text-base-content/80' : 'bg-base-100 text-base-content shadow-sm'"
              :aria-pressed="!isYearlySelected(tierName)"
              @click="toggleTo(tierName, false)"
            >
              Monthly
            </button>
            <button
              class="relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5"
              :class="isYearlySelected(tierName) ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/60 hover:text-base-content/80'"
              :aria-pressed="isYearlySelected(tierName)"
              @click="toggleTo(tierName, true)"
            >
              Yearly
              <span
                v-if="savingsForTier(tierName) > 0"
                class="inline-flex items-center rounded-full bg-success/15 px-1.5 py-0.5 text-[11px] font-semibold text-success leading-none"
              >
                -{{ savingsForTier(tierName) }}%
              </span>
            </button>
          </div>

          <!-- Price -->
          <div class="text-4xl font-semibold text-base-content">
            ${{ priceForTier(tierName).price }}
            <span class="text-base font-normal text-base-content/70">
              per month
            </span>
          </div>
          <div class="text-sm text-base-content/70 -mt-2">
            {{ priceForTier(tierName).billingNote }}
          </div>

          <!-- Savings callout (yearly only) -->
          <div
            v-if="isYearlySelected(tierName) && savingsForTier(tierName) > 0"
            class="flex items-center gap-2 text-sm text-success font-medium"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Save {{ savingsForTier(tierName) }}% with yearly billing
          </div>

          <!-- Current Plan (only on first tier card) -->
          <div
            v-if="tierName === upgradeTierNames[0]"
            class="text-sm text-base-content/80"
          >
            Your current plan:
            <span class="font-medium text-base-content">
              {{ currentPlan.name }}
            </span>
          </div>

          <!-- Button -->
          <button
            class="w-full py-2 btn btn-primary"
            @click="goToProduct(tierName)"
          >
            Upgrade
          </button>
        </div>

        <!-- Right Side -->
        <div>
          <h3 class="text-sm font-medium text-base-content mb-3">Included:</h3>

          <ul class="space-y-2 text-sm">

            <!-- NEW: Ordered items from backend (interleaved features + limits) -->
            <template
              v-if="
                getDisplayedPlan(tierName).items &&
                getDisplayedPlan(tierName).items.length > 0
              "
            >
              <li
                v-for="item in getDisplayedPlan(tierName).items"
                :key="item.key"
                class="flex items-start gap-2"
              >
                <span
                  class="inline-flex items-center"
                  :class="
                    item.type === 'feature' && !item.enabled
                      ? 'text-base-content/30'
                      : 'text-success'
                  "
                  aria-hidden="true"
                >
                  <svg
                    v-if="item.type === 'limit' || (item.type === 'feature' && item.enabled)"
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
                  <div class="text-base-content font-medium">{{ item.name }}</div>
                  <div
                    v-if="item.description"
                    class="text-sm text-base-content/70"
                  >
                    {{ item.description }}
                  </div>
                </div>
              </li>
            </template>

            <!-- OLD: Fallback when items is not available -->
            <template v-else>
              <!-- Features -->
              <li
                v-for="feat in Object.values(getDisplayedPlan(tierName).features)"
                :key="feat.key"
                class="flex items-start gap-2"
              >
                <span
                  class="inline-flex items-center"
                  :class="feat.enabled ? 'text-success' : 'text-base-content/30'"
                  aria-hidden="true"
                >
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
                  <div
                    v-if="feat.description"
                    class="text-sm text-base-content/70"
                  >
                    {{ feat.description }}
                  </div>
                </div>
              </li>

              <!-- Limits -->
              <li
                v-for="(limit, key) in getDisplayedPlan(tierName).limits"
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
                    <div
                      v-if="limit.description"
                      class="text-sm text-base-content/70"
                    >
                      {{ limit.description }}
                    </div>
                  </div>
                </div>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Plan } from '../types';

interface Props {
  /** The user's current subscription plan */
  currentPlan: Plan;
  /** All available plans (used to find next tier's monthly/yearly variants) */
  plans: Plan[];
  /** Optional: override which tiers to show. When provided, only shows these
   *  specific tiers instead of all tiers above the current one.
   *  Used by UpgradeModal for targeted upgrades. */
  upgradeToTierNames?: string[];
}

const props = defineProps<Props>();

// --- Tier grouping ---

function getTierName(plan: Plan): string {
  return plan.name.replace(/\s*\(Monthly\)\s*$/i, '').trim();
}

function isYearly(plan: Plan): boolean {
  return plan.period === 'yearly';
}

interface TierVariants {
  monthly: Plan | null;
  yearly: Plan | null;
}

const planTiers = computed<Record<string, TierVariants>>(() => {
  const tiers: Record<string, TierVariants> = {};
  for (const plan of props.plans) {
    const name = getTierName(plan);
    if (!tiers[name]) tiers[name] = { monthly: null, yearly: null };
    if (isYearly(plan)) {
      tiers[name].yearly = plan;
    } else {
      tiers[name].monthly = plan;
    }
  }
  return tiers;
});

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

const currentTierName = computed<string>(() => getTierName(props.currentPlan));

/** All tiers above the current one. */
const upgradeTierNames = computed<string[]>(() => {
  // When override is set (UpgradeModal), show only those specific tiers
  if (props.upgradeToTierNames && props.upgradeToTierNames.length > 0) {
    return props.upgradeToTierNames.filter(name => planTiers.value[name]);
  }

  const idx = orderedTierNames.value.indexOf(currentTierName.value);
  if (idx === -1) return [];
  return orderedTierNames.value.slice(idx + 1);
});

// --- Per-tier toggle state ---

/** Reactive map: tierName → whether yearly is selected for that tier. */
const yearlySelected = reactive<Record<string, boolean>>({});

/** Initialize toggle state when upgrade tiers change. */
function initTierToggles() {
  for (const name of upgradeTierNames.value) {
    if (!(name in yearlySelected)) {
      // Default to yearly if available (to surface savings)
      yearlySelected[name] = planTiers.value[name]?.yearly !== null;
    }
  }
  // Clean up removed tiers
  for (const key of Object.keys(yearlySelected)) {
    if (!upgradeTierNames.value.includes(key)) {
      delete yearlySelected[key];
    }
  }
}

// Watch for changes in upgradeTierNames
computed(() => {
  initTierToggles();
  return upgradeTierNames.value;
});

// Initialize immediately
initTierToggles();

function toggleTo(tierName: string, yearly: boolean) {
  yearlySelected[tierName] = yearly;
}

function isYearlySelected(tierName: string): boolean {
  return yearlySelected[tierName] ?? false;
}

// --- Per-tier helpers ---

function getDisplayedPlan(tierName: string): Plan {
  const variants = planTiers.value[tierName];
  if (!variants) throw new Error(`Unknown tier: ${tierName}`);
  if (yearlySelected[tierName] && variants.yearly) return variants.yearly;
  if (variants.monthly) return variants.monthly;
  return variants.yearly!;
}

function hasBothVariants(tierName: string): boolean {
  const v = planTiers.value[tierName];
  return v?.monthly !== null && v?.yearly !== null;
}

function savingsForTier(tierName: string): number {
  const v = planTiers.value[tierName];
  if (!v?.monthly || !v?.yearly) return 0;
  const monthlyAnnual = v.monthly.price * 12;
  const yearlyCost = v.yearly.price;
  if (monthlyAnnual <= 0 || yearlyCost >= monthlyAnnual) return 0;
  return Math.round(((monthlyAnnual - yearlyCost) / monthlyAnnual) * 100);
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

function priceForTier(tierName: string): { price: number; billingNote: string } {
  const plan = getDisplayedPlan(tierName);
  const period = formatPeriodAdjective(plan.period);

  let price: number;
  let billingNote: string;

  if (period === 'yearly') {
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

function goToProduct(tierName: string) {
  const plan = getDisplayedPlan(tierName);
  if (plan?.product_page) {
    window.open(plan.product_page, '_blank');
  }
}
</script>
