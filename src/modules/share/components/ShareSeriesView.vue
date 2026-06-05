<template>
  <div class="min-h-screen bg-base-100">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-8">
      <div class="text-center max-w-md">
        <div class="text-6xl mb-4">📚</div>
        <h1 class="text-2xl font-bold text-error mb-2">Content Unavailable</h1>
        <p class="text-base-content/60">{{ error }}</p>
      </div>
    </div>

    <!-- Series Table of Contents -->
    <div v-else-if="seriesData" class="max-w-3xl mx-auto px-4 py-12">
      <!-- Header -->
      <header class="mb-10 text-center">
        <h1 class="text-3xl font-bold font-serif mb-3">{{ seriesData.seriesName }}</h1>
        <p
          v-if="seriesData.seriesDescription"
          class="text-base-content/60 max-w-xl mx-auto"
        >
          {{ seriesData.seriesDescription }}
        </p>
      </header>

      <!-- Chapter list -->
      <div class="space-y-1">
        <router-link
          v-for="chapter in seriesData.chapters"
          :key="chapter.uuid"
          :to="`/s/${route.params.uuid}/chapters/${chapter.uuid}`"
          class="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-base-200 transition-colors no-underline text-base-content"
        >
          <span class="text-sm text-base-content/30 font-mono w-8 text-right shrink-0">
            {{ chapter.sequence }}
          </span>
          <span class="flex-1 font-serif">
            {{ chapter.name || 'Untitled Chapter' }}
          </span>
          <svg class="w-4 h-4 text-base-content/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>

      <!-- Empty state -->
      <div
        v-if="seriesData.chapters.length === 0"
        class="text-center py-12 text-base-content/50"
      >
        No chapters published yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useShareStore } from '../store';

const route = useRoute();
const store = useShareStore();

const seriesData = computed(() => store.seriesData);
const error = computed(() => store.error);
const loading = computed(() => store.loading);

onMounted(async () => {
  const uuid = route.params.uuid as string;
  if (uuid) {
    await store.loadSharedSeries(uuid);
  }
});
</script>

<style scoped>
.font-serif {
  font-family: Georgia, 'Times New Roman', serif;
}
</style>
