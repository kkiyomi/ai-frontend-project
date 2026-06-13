<!--
  UpgradeModal - Modal to prompt upgrading for a locked feature
  Uses the existing UpgradeCard component to show the next available plan.
-->
<template>
  <div
    v-if="billingStore.isUpgradeModalVisible"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="handleBackdropClick"
  >
     <div class="bg-base-100 rounded-lg w-full max-w-5xl h-[80vh] mx-4 flex overflow-auto shadow-2xl" @click.stop>
      <div class="flex-1 flex flex-col">
        <!-- Header -->
         <div class="flex items-center justify-between p-6 border-b border-base-300">
           <h2 class="text-lg font-semibold text-base-content">🔒 {{ titleText }}</h2>
          <button
            @click="billingStore.closeUpgradeModal()"
             class="btn btn-ghost btn-sm btn-circle"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Description -->
         <p class="p-6 pb-4 text-base-content">
          {{ descriptionText }}
        </p>

        <!-- Upgrade Card -->
        <div class="px-6 pb-4">
          <UpgradeCard
            v-if="currentPlan && billingStore.plans.length > 0"
            :currentPlan="currentPlan"
            :plans="billingStore.plans"
            :upgradeToTierNames="upgradeToTierNames.length > 0 ? upgradeToTierNames : undefined"
          />
           <div v-else class="text-center py-8 text-base-content/70">
            No upgrade option available...
          </div>
        </div>

        <!-- Maybe Later Button -->
         <div class="p-6 pt-2 border-t border-base-300">
          <button
            @click="billingStore.closeUpgradeModal()"
             class="w-full btn btn-outline"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Plan } from '../types';
import { useBillingStore } from '../store';
import UpgradeCard from './UpgradeCard.vue';

const billingStore = useBillingStore();

const featureName = computed(() => billingStore.currentUpgradeContext?.featureName || '');
const limitKey = computed(() => billingStore.currentUpgradeContext?.limitKey || '');
const currentPlan = computed(() => billingStore.subscription?.plan || null);

const isLimit = computed(() => !!limitKey.value);

const humanize = (key: string) => {
  // Replace underscores with spaces, capitalize first letters
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const titleText = computed(() => {
  if (isLimit.value) {
    return `${humanize(limitKey.value)} Reached`;
  }
  if (featureName.value) {
    return `${humanize(featureName.value)} Feature Not Available`;
  }
  return 'Feature Not Available';
});

const descriptionText = computed(() => {
  if (isLimit.value) {
    return `You've reached your ${humanize(limitKey.value).toLowerCase()}. Upgrade to a plan with higher ${humanize(limitKey.value).toLowerCase()}.`;
  }
  return `To use ${humanize(featureName.value) || 'this feature'}, you need to upgrade to a plan that includes it.`;
});

// --- Tier grouping (shared logic with UpgradeCard) ---

/** Extract the canonical tier name by stripping the "(Monthly)" suffix if present. */
function getTierName(plan: { name: string }): string {
  return plan.name.replace(/\s*\(Monthly\)\s*$/i, '').trim();
}

interface TierVariants {
  monthly: Plan | null;
  yearly: Plan | null;
}

/** Group all plans by canonical tier name. */
function groupPlansIntoTiers(plans: Plan[]): Record<string, TierVariants> {
  const tiers: Record<string, TierVariants> = {};
  for (const plan of plans) {
    const name = getTierName(plan);
    if (!tiers[name]) tiers[name] = { monthly: null, yearly: null };
    if (plan.period === 'yearly') {
      tiers[name].yearly = plan;
    } else {
      tiers[name].monthly = plan;
    }
  }
  return tiers;
}

/** Tier names ordered by minimum price among their variants (ascending). */
function orderedTiers(plans: Plan[]): string[] {
  const tiers = groupPlansIntoTiers(plans);
  return Object.entries(tiers)
    .map(([name, variants]) => ({
      name,
      minPrice: Math.min(
        variants.monthly?.price ?? Infinity,
        variants.yearly?.price ?? Infinity,
      ),
    }))
    .sort((a, b) => a.minPrice - b.minPrice)
    .map((t) => t.name);
}

/** Compute ALL tiers above current that satisfy the modal context. */
const upgradeToTierNames = computed<string[]>(() => {
  if (!currentPlan.value || !billingStore.plans.length) return [];

  const tiers = groupPlansIntoTiers(billingStore.plans);
  const currentTier = getTierName(currentPlan.value);
  const sorted = orderedTiers(billingStore.plans);
  const idx = sorted.indexOf(currentTier);
  if (idx === -1) return [];

  const eligible: string[] = [];

  // For limit upgrades: find all tiers above current with a higher limit value for that key
  if (isLimit.value && limitKey.value) {
    const currentVariant = tiers[currentTier]?.monthly ?? tiers[currentTier]?.yearly;
    const currentLimit = currentVariant?.limits[limitKey.value]?.value ?? 0;
    for (let i = idx + 1; i < sorted.length; i++) {
      const tierVariants = tiers[sorted[i]];
      const plan = tierVariants?.monthly ?? tierVariants?.yearly;
      if (!plan) continue;
      const planLimit = plan.limits[limitKey.value]?.value ?? 0;
      if (planLimit > currentLimit) eligible.push(sorted[i]);
    }
    return eligible;
  }

  // For feature upgrades: find all tiers above current that include the required feature
  for (let i = idx + 1; i < sorted.length; i++) {
    const tierVariants = tiers[sorted[i]];
    const plan = tierVariants?.monthly ?? tierVariants?.yearly;
    if (!plan) continue;

    if (featureName.value) {
      const feat = plan.features[featureName.value];
      if (!feat || !feat.enabled) continue;
    }
    eligible.push(sorted[i]);
  }

  return eligible;
});

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    billingStore.closeUpgradeModal();
  }
};
</script>
