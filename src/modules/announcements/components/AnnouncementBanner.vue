<template>
  <div
    class="announcement-banner px-4 py-3 rounded-md shadow-sm border-l-4"
    :class="bannerClasses"
    role="alert"
    aria-live="polite"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-semibold mb-1">{{ announcement.title }}</h4>
        <p class="text-sm opacity-90">{{ announcement.content }}</p>
        <div v-if="showDate" class="mt-2 text-xs opacity-75">
          {{ formattedDate }}
        </div>
      </div>
      <button
        @click="$emit('close')"
        class="ml-4 p-1 rounded-md hover:bg-black/10 transition-colors"
        aria-label="Dismiss announcement"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Announcement } from '../types';

interface Props {
  announcement: Announcement;
  showDate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDate: true
});

defineEmits<{
  close: [];
}>();

const bannerClasses = computed(() => {
  const base = 'border-l-4 ';
  switch (props.announcement.type) {
    case 'warning':
      return base + 'bg-yellow-50 border-yellow-400 text-yellow-800';
    case 'error':
      return base + 'bg-red-50 border-red-400 text-red-800';
    case 'info':
    default:
      return base + 'bg-blue-50 border-blue-400 text-blue-800';
  }
});

const formattedDate = computed(() => {
  const date = props.announcement.date;
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
});
</script>

<style scoped>
.announcement-banner {
  transition: all 0.2s ease;
}
</style>