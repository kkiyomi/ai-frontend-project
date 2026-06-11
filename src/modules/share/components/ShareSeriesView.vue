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
    <div v-else-if="seriesData">
      <!-- Top bar: brand -->
      <ShareBrandBar :title="seriesData?.seriesName" />

      <div class="max-w-3xl mx-auto px-4 py-12">
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

      <!-- Owner: select-all checkbox -->
      <div v-if="store.isOwner && seriesData.chapters.length > 0" class="flex items-center gap-2 mb-2 px-4">
        <input
          type="checkbox"
          class="checkbox checkbox-sm"
          :checked="allFilteredSelected"
          @change="toggleSelectAll"
        />
        <span class="text-sm text-base-content/50">Select All ({{ filteredChapters.length }})</span>
      </div>

      <!-- Owner: mass action bar -->
      <div v-if="store.isOwner && selection.size > 0" class="bg-base-200 rounded-lg p-3 mb-4 flex items-center gap-3 flex-wrap">
        <span class="text-sm font-medium">{{ selection.size }} selected</span>
        <button
          class="btn btn-sm btn-success"
          :disabled="massActionPending"
          @click="doMassPublish"
        >
          <span v-if="massActionPending" class="loading loading-spinner loading-xs"></span>
          Publish Selected
        </button>
        <button
          class="btn btn-sm btn-error"
          :disabled="massActionPending"
          @click="doMassUnpublish"
        >
          <span v-if="massActionPending" class="loading loading-spinner loading-xs"></span>
          Unpublish Selected
        </button>
        <button class="btn btn-sm btn-ghost" @click="selection = new Set(); lastClickedIndex = null">
          Deselect All
        </button>
      </div>

      <!-- Flash message -->
      <div v-if="flashMessage" class="alert alert-success mb-4">
        {{ flashMessage }}
      </div>

      <!-- Chapter list -->
      <div class="space-y-1">
        <div
          v-for="(chapter, index) in filteredChapters"
          :key="chapter.uuid"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition-colors group"
          @mousedown.capture="onRowMouseDown"
        >
          <!-- Owner: selection checkbox -->
          <input
            v-if="store.isOwner"
            type="checkbox"
            class="checkbox checkbox-sm shrink-0"
            :checked="isSelected(chapter.uuid)"
            @click="handleCheckboxClick(chapter.uuid, index, $event)"
          />
          <router-link
            :to="`/s/${seriesUuid}/${chapter.uuid}`"
            class="flex-1 font-serif no-underline text-base-content"
            @click.prevent.shift="handleLinkShiftClick(chapter.uuid, index)"
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

      <!-- Brand footer -->
      <ShareBrandFooter />
    </div>
    </div>

    <!-- Fallback: initial render before data loads -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useShareStore } from '../store';
import { shareAPI } from '../api';
import { usePageMeta, useScrollRestore } from '@/composables';
import ShareBrandBar from './ShareBrandBar.vue';
import ShareBrandFooter from './ShareBrandFooter.vue';

const route = useRoute();
const store = useShareStore();

const seriesData = computed(() => store.seriesData);
const error = computed(() => store.error);
const loading = computed(() => store.loading);
const contentReady = computed(() => !loading.value && !!seriesData.value);
useScrollRestore(contentReady);
const seriesUuid = computed(() => route.params.seriesUuid as string);

// Page meta — sets document.title and og: meta tags for social sharing
const pageMeta = computed(() => {
  const d = seriesData.value;
  if (!d) return null;
  const APP = 'Absolute Mystery';
  return {
    title: `${d.seriesName} — ${APP}`,
    description: d.seriesDescription,
    ogType: 'website' as const,
  };
});
usePageMeta(pageMeta);

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
  const chapters = seriesData.value?.chapters ?? [];
  const base = (!store.isOwner || activeFilter.value === 'all')
    ? chapters
    : chapters.filter((c) => c.isPublished === (activeFilter.value === 'published'));
  // Latest first (reverse sequence order)
  return [...base].reverse();
});

// Chapter selection for mass publish/unpublish
const selection = ref<Set<string>>(new Set());
const lastClickedIndex = ref<number | null>(null);

function isSelected(uuid: string): boolean {
  return selection.value.has(uuid);
}

function toggleSelection(uuid: string) {
  const next = new Set(selection.value);
  if (next.has(uuid)) {
    next.delete(uuid);
  } else {
    next.add(uuid);
  }
  selection.value = next;
}

function handleCheckboxClick(uuid: string, index: number, event: MouseEvent) {
  if (event.shiftKey) {
    handleShiftRangeSelect(uuid, index);
  } else {
    toggleSelection(uuid);
    lastClickedIndex.value = index;
  }
}

// Fires when the user shift+clicks the chapter name link.
// The .prevent modifier stops router navigation on shift+click.
function handleLinkShiftClick(uuid: string, index: number) {
  handleShiftRangeSelect(uuid, index);
}

// Capture-phase mousedown on the row div prevents browser
// text selection when the user shift+clicks anywhere on the row.
function onRowMouseDown(event: MouseEvent) {
  if (store.isOwner && event.shiftKey) {
    event.preventDefault();
  }
}

function handleShiftRangeSelect(uuid: string, index: number) {
  if (lastClickedIndex.value === null || lastClickedIndex.value >= filteredChapters.value.length) {
    // No valid anchor (e.g. cleared by filter change): make clicked item
    // selected and set it as the new anchor. Use add (not toggle) because
    // the browser already toggled the native checkbox state.
    const next = new Set(selection.value);
    next.add(uuid);
    selection.value = next;
    lastClickedIndex.value = index;
    return;
  }

  const start = Math.min(lastClickedIndex.value, index);
  const end = Math.max(lastClickedIndex.value, index);
  const chapters = filteredChapters.value;
  const next = new Set(selection.value);
  for (let i = start; i <= end; i++) {
    next.add(chapters[i].uuid);
  }
  selection.value = next;
  // Anchor stays at the original position for subsequent shift+clicks
}

const allFilteredSelected = computed(() => {
  const filtered = filteredChapters.value;
  if (filtered.length === 0) return false;
  return filtered.every((c) => selection.value.has(c.uuid));
});

function toggleSelectAll() {
  if (allFilteredSelected.value) {
    // Deselect all filtered
    const filteredUuids = new Set(filteredChapters.value.map((c) => c.uuid));
    const next = new Set(selection.value);
    for (const uuid of filteredUuids) next.delete(uuid);
    selection.value = next;
  } else {
    // Select all filtered
    const next = new Set(selection.value);
    for (const c of filteredChapters.value) next.add(c.uuid);
    selection.value = next;
  }
  lastClickedIndex.value = null;
}

// Clear selection and anchor when filter changes or on mount
watch(activeFilter, () => { selection.value = new Set(); lastClickedIndex.value = null; });

// Mass action state
const massActionPending = ref(false);
const flashMessage = ref<string | null>(null);
let flashTimer: ReturnType<typeof setTimeout> | null = null;

function showFlash(msg: string) {
  flashMessage.value = msg;
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => { flashMessage.value = null; }, 3000);
}

async function doMassPublish() {
  massActionPending.value = true;
  try {
    const resp = await store.toggleChaptersPublish([...selection.value], true);
    if (resp.success && resp.data) {
      showFlash(`Published ${resp.data.updated} chapters`);
    } else {
      showFlash('Failed to publish chapters');
    }
    selection.value = new Set();
    lastClickedIndex.value = null;
  } catch {
    showFlash('Failed to publish chapters');
  } finally {
    massActionPending.value = false;
  }
}

async function doMassUnpublish() {
  massActionPending.value = true;
  try {
    const resp = await store.toggleChaptersPublish([...selection.value], false);
    if (resp.success && resp.data) {
      showFlash(`Unpublished ${resp.data.updated} chapters`);
    } else {
      showFlash('Failed to unpublish chapters');
    }
    selection.value = new Set();
    lastClickedIndex.value = null;
  } catch {
    showFlash('Failed to unpublish chapters');
  } finally {
    massActionPending.value = false;
  }
}

async function saveSettings() {
  if (!store.currentLink) return;
  await shareAPI.updateShareLink(store.currentLink.uuid, {
    includeGlossary: includeGlossary.value,
    includeRaw: includeRaw.value,
  });
}

onMounted(async () => {
  selection.value = new Set();
  lastClickedIndex.value = null;
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
