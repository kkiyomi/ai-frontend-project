<template>
  <router-view v-if="$route.name === 'Share'" />
  <div v-else class="h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <SidebarMain />

    <!-- Main Content -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Translation View (always full width) -->
      <div class="h-full">
        <TranslationView />
      </div>

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
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue';
import SidebarMain from './components/SidebarMain.vue';
import TranslationView from './components/TranslationView.vue';
import { GlossaryPanel, useGlossaryStore } from '@/modules/glossary';
import { useSeriesStore } from '@/modules/series';
import { useChaptersStore } from '@/modules/chapters';
import { useSeriesWithChapters } from '@/composables';

const glossary = useGlossaryStore();
const {
  isGlossaryVisible,
  toggleVisibility: toggleGlossaryVisibility,
  loadTerms: loadGlossaryTerms,
} = glossary;

const seriesStore = useSeriesStore();
const chaptersStore = useChaptersStore();

const currentChapter = computed(() => chaptersStore.currentChapter);
const { selectedSeriesWithChapters: currentSeries } = useSeriesWithChapters();

onMounted(async () => {
  await seriesStore.fetchSeries();
  await chaptersStore.loadChapters();
});

const closeGlossaryIfClickedOutside = (event: Event) => {
  if (event.target === event.currentTarget) {
    toggleGlossaryVisibility();
  }
};

// Watch for chapter changes and reload glossary
watch(() => currentChapter.value?.id, () => {
  if (currentChapter.value) {
    loadGlossaryTerms(currentSeries.value?.id, currentChapter.value?.id);
  }
});
</script>