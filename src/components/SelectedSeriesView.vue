<template>
  <!-- Series Header -->
  <div class="bg-blue-50 p-3 border-b border-gray-200">
    <!-- Top Row: Icons -->
    <div class="flex items-center justify-between">
      <!-- Left: Back -->
      <button
        @click="deselectSeries"
        class="p-1 text-blue-600 hover:text-blue-700 transition-colors"
        title="Back to all series"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Right: Actions -->
      <div class="flex items-center space-x-1">
        <!-- Add Chapter -->
        <button
          @click="handleCreateChapter('New Chapter!')"
          class="p-1 text-gray-400 hover:text-green-600 transition-colors"
          title="Add chapter"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <!-- Edit -->
        <button
          @click="$emit('edit', series)"
          class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="Edit series"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <!-- Bulk Upload -->
        <BulkChapterUpload :seriesId="series.id" />

        <!-- Delete -->
        <button
          @click="$emit('delete', series.id)"
          class="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove series"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Bottom: Series Info -->
    <div class="p-3">
      <h4 class="text-sm font-semibold text-gray-900">{{ series.name }}</h4>

      <p v-if="series.description" class="text-xs text-gray-500 mt-1">
        {{ series.description }}
      </p>

      <div class="flex items-center space-x-3 mt-2 text-xs text-gray-400">
        <span>{{ series.chapters.length }} chapters</span>
        <span>{{ translationProgress }}% translated</span>
      </div>
    </div>


    <!-- Series Progress Bar -->
    <div class="mt-2">
      <div class="bg-gray-200 rounded-full h-1">
        <div
          class="bg-blue-500 h-1 rounded-full transition-all duration-300"
          :style="{ width: `${translationProgress}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSeriesStore } from '@/modules/series';
import { useChaptersStore, BulkChapterUpload } from '@/modules/chapters';
import { getSeriesTranslationProgress } from '../utils/chapterUtils';
import type { SeriesWithChapters as Series, Chapter } from '../types';

const seriesStore = useSeriesStore();
const chaptersStore = useChaptersStore();

interface Props {
  series: Series;
}

const props = defineProps<Props>();

defineEmits<{
  edit: [series: Series];
  delete: [seriesId: string];
}>();

const handleCreateChapter = async (title: string) => {
  if (!props.series.id) return;

  try {
    const emptyContent = `Chapter: ${title}\n\n[Add your content here...]`;

    const newChapter = await chaptersStore.createChapter({
      title,
      content: `Chapter: ${title}\n\n[Add your content here...]`,
      translatedContent: '[Add your translation here...]',
      seriesId: props.series.id
    });

    if (newChapter) {
      chaptersStore.selectChapter(newChapter.id)
    }

  } catch (error) {
    console.error('Error creating chapter:', error);
  }
};

const deselectSeries = () => {
  seriesStore.selectSeries(null);
  chaptersStore.selectChapter(null);
};

const translationProgress = computed(() => getSeriesTranslationProgress(props.series));
</script>