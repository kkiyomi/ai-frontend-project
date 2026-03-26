<template>
  <div v-if="currentAnnouncement" class="announcement-banner-manager">
    <AnnouncementBanner
      :announcement="currentAnnouncement!"
      @close="dismissCurrent"
    />
    <div v-if="hasMultipleAnnouncements" class="flex items-center justify-center mt-2 space-x-2">
      <button
        @click="prevAnnouncement"
        class="p-1 rounded-md hover:bg-gray-200 transition-colors"
        aria-label="Previous announcement"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="text-xs text-gray-500">{{ currentIndex + 1 }} / {{ activeAnnouncements.length }}</span>
      <button
        @click="nextAnnouncement"
        class="p-1 rounded-md hover:bg-gray-200 transition-colors"
        aria-label="Next announcement"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAnnouncementsStore } from '../store';
import AnnouncementBanner from './AnnouncementBanner.vue';

const store = useAnnouncementsStore();
const currentIndex = ref(0);

const activeAnnouncements = computed(() => store.activeAnnouncements);
const hasActiveAnnouncements = computed(() => activeAnnouncements.value.length > 0);
const hasMultipleAnnouncements = computed(() => activeAnnouncements.value.length > 1);
const currentAnnouncement = computed(() => {
  if (!hasActiveAnnouncements.value) return null;
  return activeAnnouncements.value[currentIndex.value];
});

onMounted(() => {
  // Fetch announcements on mount
  store.fetchAnnouncements();
});

function dismissCurrent() {
  if (currentAnnouncement.value) {
    store.dismissAnnouncement(currentAnnouncement.value.id);
    // If there are still announcements after dismissal, reset index if out of bounds
    if (currentIndex.value >= activeAnnouncements.value.length) {
      currentIndex.value = Math.max(0, activeAnnouncements.value.length - 1);
    }
  }
}

function nextAnnouncement() {
  if (!hasMultipleAnnouncements.value) return;
  currentIndex.value = (currentIndex.value + 1) % activeAnnouncements.value.length;
}

function prevAnnouncement() {
  if (!hasMultipleAnnouncements.value) return;
  currentIndex.value = (currentIndex.value - 1 + activeAnnouncements.value.length) % activeAnnouncements.value.length;
}
</script>

<style scoped>
.announcement-banner-manager {
  position: relative;
  z-index: 50;
}
</style>