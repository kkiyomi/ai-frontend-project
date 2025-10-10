<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
    <div
      class="bg-gray-50 p-4 cursor-pointer"
      @click="toggleSeriesSelection(series.id)"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-900">{{ series.name }}</h4>
          <p v-if="series.description" class="text-xs text-gray-500 mt-1 line-clamp-2">
            {{ series.description }}
          </p>
          <div class="flex items-center space-x-3 mt-2 text-xs text-gray-400">
            <span>{{ series.chapterIds.length }} chapters</span>
            <span>Created {{ formatDate(new Date(series.createdAt)) }}</span>
          </div>
        </div>
        <div class="flex items-center space-x-1 ml-2">
          <button
            @click.stop="$emit('edit', series)"
            class="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit series"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click.stop="$emit('delete', series.id)"
            class="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete series"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeriesStore } from '../store';
import type { Series } from '../types';

interface Props {
  series: Series;
}

defineProps<Props>();

defineEmits<{
  edit: [series: Series];
  delete: [seriesId: string];
}>();

const seriesStore = useSeriesStore();

const toggleSeriesSelection = (seriesId: string) => {
  seriesStore.selectSeries(seriesId);
};

function formatDate(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return date.toLocaleDateString();
}
</script>
