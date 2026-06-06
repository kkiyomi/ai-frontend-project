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
        <!-- Owner: share settings button -->
        <div v-if="store.isOwner" class="mt-3">
          <button
            @click="showSettings = !showSettings"
            class="btn btn-sm btn-ghost"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Share Settings
          </button>
          <!-- Inline settings panel -->
          <div v-if="showSettings" class="mt-2 p-3 bg-base-200 rounded-lg text-left text-sm max-w-xs mx-auto space-y-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="includeGlossary" @change="saveSettings" type="checkbox" class="checkbox checkbox-xs" />
              Include glossary
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="includeRaw" @change="saveSettings" type="checkbox" class="checkbox checkbox-xs" />
              Include raw content
            </label>
          </div>
        </div>
      </header>

      <!-- Owner: chapter filter -->
      <div v-if="store.isOwner && seriesData.chapters.length > 0" class="flex justify-center gap-1 mb-6">
        <button
          v-for="f in filters"
          :key="f.key"
          @click="activeFilter = f.key"
          class="btn btn-xs"
          :class="activeFilter === f.key ? 'btn-active' : 'btn-ghost'"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Chapter list -->
      <div class="space-y-1">
        <div
          v-for="chapter in filteredChapters"
          :key="chapter.uuid"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-colors group"
        >
          <router-link
            :to="`/s/${seriesUuid}/${chapter.uuid}`"
            class="flex-1 font-serif no-underline text-base-content"
          >
            {{ chapter.name || 'Untitled Chapter' }}
          </router-link>
          <!-- Owner: publish toggle -->
          <button
            v-if="store.isOwner"
            @click.stop="store.toggleChapterPublish(chapter.uuid, !chapter.isPublished)"
            class="btn btn-xs shrink-0"
            :class="chapter.isPublished ? 'btn-success btn-outline' : 'btn-error btn-outline'"
          >
            {{ chapter.isPublished ? 'Published' : 'Unpublished' }}
          </button>
          <svg class="w-4 h-4 text-base-content/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useShareStore } from '../store';
import { shareAPI } from '../api';

const route = useRoute();
const store = useShareStore();

const seriesData = computed(() => store.seriesData);
const error = computed(() => store.error);
const loading = computed(() => store.loading);
const seriesUuid = computed(() => route.params.seriesUuid as string);

// Owner settings
const showSettings = ref(false);
const includeGlossary = ref(false);
const includeRaw = ref(false);

// Chapter filter (owner only)
const activeFilter = ref<'all' | 'published' | 'unpublished'>('all');
const filters = [
  { key: 'all' as const, label: 'All' },
  { key: 'published' as const, label: 'Published' },
  { key: 'unpublished' as const, label: 'Unpublished' },
];
const filteredChapters = computed(() => {
  if (!store.isOwner || activeFilter.value === 'all') return seriesData.value?.chapters ?? [];
  const wantPublished = activeFilter.value === 'published';
  return (seriesData.value?.chapters ?? []).filter(
    (c) => c.isPublished === wantPublished,
  );
});

async function saveSettings() {
  if (!store.currentLink) return;
  await shareAPI.updateShareLink(store.currentLink.uuid, {
    includeGlossary: includeGlossary.value,
    includeRaw: includeRaw.value,
  });
}

onMounted(async () => {
  const uuid = route.params.seriesUuid as string;
  if (uuid) {
    await store.loadSharedSeries(uuid);
    // Sync settings from current link
    if (store.currentLink) {
      includeGlossary.value = store.currentLink.includeGlossary;
      includeRaw.value = store.currentLink.includeRaw;
    }
  }
});
</script>

<style scoped>
.font-serif {
  font-family: Georgia, 'Times New Roman', serif;
}
</style>
