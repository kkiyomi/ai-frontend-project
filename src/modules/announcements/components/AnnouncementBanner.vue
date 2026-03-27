<template>
  <div
    class="flex items-center justify-between px-4 py-2 rounded-md shadow-sm border-b-4 text-sm"
    :class="bannerClasses"
    role="alert"
    aria-live="polite"
  >
    <span class="flex-1 text-center truncate">
      {{ announcement.title }} - {{ announcement.content }}
      <span v-if="showDate" class="opacity-70 ml-2">
        ({{ formattedDate }})
      </span>
    </span>

    <button
      @click="$emit('close')"
      class="ml-3 p-1 rounded hover:bg-black/10 transition"
      aria-label="Dismiss announcement"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
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
  switch (props.announcement.type) {
    case 'warning':
      return 'bg-yellow-50 border-yellow-400 text-yellow-800';
    case 'error':
      return 'bg-red-50 border-red-400 text-red-800';
    default:
      return 'bg-blue-50 border-blue-400 text-blue-800';
  }
});

const formattedDate = computed(() => {
  const date = props.announcement.date;
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
});
</script>
