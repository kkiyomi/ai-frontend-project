<template>
  <router-view v-if="$route.name === 'Share'" />
  <div v-else class="h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <SidebarMain />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Translation View (always full width) -->
      <TranslationView />

      <!-- Glossary Panel Overlay -->
      <div v-if="isGlossaryVisible" class="absolute inset-0 bg-black/50 z-30 flex justify-end"
        @click="closeGlossaryIfClickedOutside">
        <!-- Glossary Panel -->
        <div
          class="w-80 h-full bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out"
          @click.stop>
          <GlossaryPanel
            :currentChapter="currentChapter"
            :currentSeries="currentSeries"
          />
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <SettingsModal />
    
    <!-- Upgrade Modal -->
    <UpgradeModal v-if="billingStore.isUpgradeModalVisible" />

    <DevFeaturePanel />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue';
import SidebarMain from './components/SidebarMain.vue';
import TranslationView from './components/TranslationView.vue';
import { DevFeaturePanel } from '@/modules/features';
import { SettingsModal } from '@/modules/core';
import { GlossaryPanel, useGlossaryStore } from '@/modules/glossary';
import { useSeriesStore } from '@/modules/series';
import { useChaptersStore } from '@/modules/chapters';
import { UpgradeModal, useBillingStore } from '@/modules/billing';
import { useSeriesWithChapters } from '@/composables';

const seriesStore = useSeriesStore();
const chaptersStore = useChaptersStore();
const glossaryStore = useGlossaryStore();
const billingStore = useBillingStore();

const currentChapter = computed(() => chaptersStore.currentChapter);
const isGlossaryVisible = computed(() => glossaryStore.isGlossaryVisible);
const { selectedSeriesWithChapters: currentSeries } = useSeriesWithChapters();

onMounted(async () => {
  await seriesStore.fetchSeries();
  await chaptersStore.loadChapters();
  await billingStore.fetchSubscription();
  await billingStore.loadPlans();
});

const closeGlossaryIfClickedOutside = (event: Event) => {
  if (event.target === event.currentTarget) {
    glossaryStore.toggleVisibility();
  }
};

// Watch for chapter changes and reload glossary
watch(() => currentChapter.value?.id, () => {
  if (currentChapter.value) {
    glossaryStore.loadTerms(currentSeries.value?.id, currentChapter.value?.id);
  }
});
</script>
