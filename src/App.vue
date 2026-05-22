<template>
  <router-view v-if="$route.name === 'Share'" />
  <div v-else class="h-screen flex flex-col bg-base-100">
    <!-- Announcement Banner at the very top -->
    <AnnouncementBannerManager />

    <!-- Main content area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <SidebarMain />

      <!-- Main Content -->
      <div class="flex-1 flex flex-row overflow-hidden">
        <!-- Translation View (shrinks when glossary panel is visible) -->
        <TranslationView />

        <!-- Glossary Side Panel (side-by-side, not overlay) -->
        <div v-if="isGlossaryVisible" class="flex-shrink-0 w-80 border-l border-base-300">
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
    
    <!-- Error Modal -->
    <ErrorModal v-if="errorStore.showErrorModal" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import SidebarMain from './components/SidebarMain.vue';
import TranslationView from './components/TranslationView.vue';
import { SettingsModal, ErrorModal, useErrorStore } from '@/modules/core';
import { GlossaryPanel, useGlossaryStore } from '@/modules/glossary';
import { useSeriesStore } from '@/modules/series';
import { useChaptersStore } from '@/modules/chapters';
import { UpgradeModal, useBillingStore } from '@/modules/billing';
import { AnnouncementBannerManager } from '@/modules/announcements';
import { useSeriesWithChapters } from '@/composables';
import { useSettingsRouteSync } from '@/composables/useSettingsRouteSync';

interface Props {
  seriesId?: string;
  chapterId?: string;
}

const props = defineProps<Props>();
const router = useRouter();

const seriesStore = useSeriesStore();
const chaptersStore = useChaptersStore();
const glossaryStore = useGlossaryStore();
const billingStore = useBillingStore();
const errorStore = useErrorStore();

const currentChapter = computed(() => chaptersStore.currentChapter);
const isGlossaryVisible = computed(() => glossaryStore.isGlossaryVisible);
const { selectedSeriesWithChapters: currentSeries } = useSeriesWithChapters();
useSettingsRouteSync();

onMounted(async () => {
  await seriesStore.fetchSeries();
  await chaptersStore.loadChapters();
  await billingStore.fetchSubscription();
  await billingStore.loadPlans();
});

// Watch for chapter changes and reload glossary
watch(() => currentChapter.value?.id, () => {
  if (currentChapter.value) {
    glossaryStore.loadTerms(currentSeries.value?.id, currentChapter.value?.id);
  }
});

// Watch for route prop changes and sync store (as backup to route guard)
watch(() => props.seriesId, (newSeriesId) => {
  if (newSeriesId) {
    seriesStore.selectSeries(newSeriesId);
  } else {
    seriesStore.selectSeries(null);
  }
}, { immediate: true });

watch(() => props.chapterId, (newChapterId) => {
  if (newChapterId) {
    chaptersStore.selectChapter(newChapterId);
  } else {
    chaptersStore.selectChapter(null);
  }
}, { immediate: true });

</script>
