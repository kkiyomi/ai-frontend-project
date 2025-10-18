<template>
  <div class="border-b border-secondary-200 p-4">
    <div class="flex items-center justify-between">
      <div v-if="currentChapter">
        <h2 class="text-lg font-semibold text-secondary-900">{{ currentChapter.title }}</h2>
        <p class="text-sm text-secondary-500">
          {{ currentChapter.originalParagraphs.length }} original paragraphs
          <span v-if="currentChapter.translatedParagraphs.length > 0">
            • {{ currentChapter.translatedParagraphs.length }} translated paragraphs
          </span>
        </p>
      </div>
      <div v-else class="text-secondary-500">
        Select a chapter to begin translation
      </div>
      
      <div v-if="currentChapter" class="flex items-center space-x-2">
        <!-- Share Button -->
        <ShareButton
          :chapters="allChapters"
          :series="allSeries"
        />
        <button
          @click="editor.toggleLayoutMode()"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
        >
          {{ layoutMode === 'split' ? 'Full Text View' : 'Split View' }}
        </button>
        <button
          @click="editor.toggleContentMode()"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
        >
          {{ contentMode === 'all' ? 'Translated Only' : 'Show All' }}
        </button>
        <button
          @click="$emit('translateAll')"
          :disabled="isTranslating"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-blue-700"
        >
          {{ isTranslating ? 'Translating...' : 'Translate All' }}
        </button>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div v-if="isTranslating" class="mt-3">
      <div class="bg-gray-200 rounded-full h-3">
        <div 
          class="bg-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm"
          :style="{ width: `${translationProgress}%` }"
        ></div>
      </div>
      <p class="text-sm text-gray-600 mt-2 font-medium">{{ Math.round(translationProgress) }}% complete</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ShareButton } from '@/modules/sharing';
import { useChaptersStore } from '@/modules/chapters';
import { useSeriesStore } from '@/modules/series';
import { type Chapter, useEditorStore } from '@/modules/editor';
import type { Series } from '@/types';

interface Props {
  currentChapter: Chapter | null;
  isEditingOriginal: boolean;
  layoutMode: 'split' | 'full';
  contentMode: 'all' | 'translated';
  isTranslating: boolean;
  translationProgress: number;
}

defineProps<Props>();

const chaptersStore = useChaptersStore();
const seriesStore = useSeriesStore();
const editor = useEditorStore();

const allChapters = computed(() => chaptersStore.chapters);
const allSeries = computed(() => {
  return seriesStore.series.map(s => ({
    ...s,
    chapters: chaptersStore.getChaptersBySeriesId(s.id)
  }));
});

defineEmits<{
  translateAll: [];
}>();
</script>