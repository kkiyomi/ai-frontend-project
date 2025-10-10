<template>
  <ShareView
    :chapters="allChapters"
    :series="allSeries"
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useChaptersStore } from '@/modules/chapters';
import { useSeriesStore } from '@/modules/series';
import { ShareView } from '@/modules/sharing';
import type { SeriesWithChapters as Series } from '@/types';

const chaptersStore = useChaptersStore();
const seriesStore = useSeriesStore();

const allChapters = computed(() => chaptersStore.chapters);

// Construct series with chapters
const allSeries = computed((): Series[] => {
  return seriesStore.series.map(s => ({
    ...s,
    chapters: chaptersStore.getChaptersBySeriesId(s.id)
  }));
});

// Load data if not already loaded
onMounted(async () => {
  if (seriesStore.series.length === 0) {
    await seriesStore.fetchSeries();
  }
  if (allChapters.value.length === 0) {
    await chaptersStore.loadChapters();
  }
});
</script>
