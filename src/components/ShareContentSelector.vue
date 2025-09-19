<template>
  <div class="space-y-4">
    <!-- Single Chapter Selection -->
    <div v-if="shareType === 'chapter'">
      <h4 class="font-medium text-gray-900 mb-3">Select Chapter</h4>
      <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
        <div v-for="seriesItem in series" :key="seriesItem.id" class="border-b border-gray-100 last:border-b-0">
          <div class="p-3 bg-gray-50 font-medium text-gray-900 text-sm">{{ seriesItem.name }}</div>
          <div class="divide-y divide-gray-100">
            <label
              v-for="chapter in getTranslatedChapters(seriesItem.chapters)"
              :key="chapter.id"
              class="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
            >
              <input
                :value="chapter.id"
                :checked="selectedChapterId === chapter.id"
                @change="$emit('update:selectedChapterId', chapter.id)"
                type="radio"
                class="text-blue-600 focus:ring-blue-500"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">{{ chapter.title }}</div>
                <div class="text-xs text-gray-500">{{ getTranslationProgress(chapter) }}% translated • {{ chapter.originalParagraphs.length }} paragraphs</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Multiple Chapters Selection -->
    <div v-if="shareType === 'chapters'">
      <h4 class="font-medium text-gray-900 mb-3">Select Chapters</h4>
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <button
            @click="$emit('selectAllChapters')"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            Select All
          </button>
          <span class="text-gray-300">|</span>
          <button
            @click="$emit('clearAllChapters')"
            class="text-sm text-gray-600 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
        <div class="text-sm text-gray-500">{{ selectedChapterIds.length }} selected</div>
      </div>
      
      <div class="mb-3">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Search chapters..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      <div class="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
        <div v-for="seriesItem in filteredSeries" :key="seriesItem.id" class="border-b border-gray-100 last:border-b-0">
          <div class="p-3 bg-gray-50 font-medium text-gray-900 text-sm flex items-center justify-between">
            <span>{{ seriesItem.name }}</span>
            <div class="flex items-center space-x-2">
              <button
                @click="$emit('toggleSeriesSelection', seriesItem.id)"
                class="text-xs text-blue-600 hover:text-blue-700"
              >
                {{ isSeriesFullySelected(seriesItem.id) ? 'Deselect All' : 'Select All' }}
              </button>
              <span class="text-xs text-gray-500">
                {{ getSelectedChaptersInSeries(seriesItem.id) }}/{{ getTranslatedChapters(seriesItem.chapters).length }}
              </span>
            </div>
          </div>
          <div class="divide-y divide-gray-100">
            <label
              v-for="chapter in getFilteredChapters(seriesItem.chapters)"
              :key="chapter.id"
              class="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
            >
              <input
                :value="chapter.id"
                :checked="selectedChapterIds.includes(chapter.id)"
                @change="handleChapterToggle(chapter.id, ($event.target as HTMLInputElement).checked)"
                type="checkbox"
                class="text-blue-600 focus:ring-blue-500"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">{{ chapter.title }}</div>
                <div class="text-xs text-gray-500">{{ getTranslationProgress(chapter) }}% translated • {{ chapter.originalParagraphs.length }} paragraphs</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Series Selection -->
    <div v-if="shareType === 'series'">
      <h4 class="font-medium text-gray-900 mb-3">Select Series</h4>
      <div class="space-y-2">
        <label
          v-for="seriesItem in getSeriesWithTranslations()"
          :key="seriesItem.id"
          class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          <input
            :value="seriesItem.id"
            :checked="selectedSeriesId === seriesItem.id"
            @change="$emit('update:selectedSeriesId', seriesItem.id)"
            type="radio"
            class="text-blue-600 focus:ring-blue-500"
          />
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900">{{ seriesItem.name }}</div>
            <div class="text-xs text-gray-500">
              {{ getSeriesTranslationProgress(seriesItem) }}% translated • {{ seriesItem.chapters.length }} chapters • {{ getSeriesWordCount(seriesItem) }} words
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- Multiple Series Selection -->
    <div v-if="shareType === 'multiple-series'">
      <h4 class="font-medium text-gray-900 mb-3">Select Series</h4>
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <button
            @click="$emit('selectAllSeries')"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            Select All
          </button>
          <span class="text-gray-300">|</span>
          <button
            @click="$emit('clearAllSeries')"
            class="text-sm text-gray-600 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
        <div class="text-sm text-gray-500">{{ selectedSeriesIds.length }} selected</div>
      </div>
      
      <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
        <label
          v-for="seriesItem in getSeriesWithTranslations()"
          :key="seriesItem.id"
          class="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
        >
          <input
            :value="seriesItem.id"
            :checked="selectedSeriesIds.includes(seriesItem.id)"
            @change="handleSeriesToggle(seriesItem.id, ($event.target as HTMLInputElement).checked)"
            type="checkbox"
            class="text-blue-600 focus:ring-blue-500"
          />
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900">{{ seriesItem.name }}</div>
            <div class="text-xs text-gray-500">
              {{ getSeriesTranslationProgress(seriesItem) }}% translated • {{ seriesItem.chapters.length }} chapters • {{ getSeriesWordCount(seriesItem) }} words
            </div>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Series, Chapter } from '../types';

interface Props {
  shareType: string;
  series: Series[];
  selectedChapterId: string;
  selectedChapterIds: string[];
  selectedSeriesId: string;
  selectedSeriesIds: string[];
  searchQuery: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:selectedChapterId': [id: string];
  'update:selectedChapterIds': [ids: string[]];
  'update:selectedSeriesId': [id: string];
  'update:selectedSeriesIds': [ids: string[]];
  'update:searchQuery': [query: string];
  'selectAllChapters': [];
  'clearAllChapters': [];
  'selectAllSeries': [];
  'clearAllSeries': [];
  'toggleSeriesSelection': [seriesId: string];
}>();

const filteredSeries = computed(() => {
  if (!props.searchQuery) return props.series;
  
  return props.series.map(s => ({
    ...s,
    chapters: s.chapters.filter(c => 
      c.title.toLowerCase().includes(props.searchQuery.toLowerCase())
    )
  })).filter(s => s.chapters.length > 0);
});

const getTranslatedChapters = (chapters: Chapter[]) => {
  return chapters.filter(chapter => 
    chapter.originalParagraphs.some(p => p.trim())
  );
};

const getFilteredChapters = (chapters: Chapter[]) => {
  const translated = getTranslatedChapters(chapters);
  if (!props.searchQuery) return translated;
  
  return translated.filter(c => 
    c.title.toLowerCase().includes(props.searchQuery.toLowerCase())
  );
};

const getSeriesWithTranslations = () => {
  return props.series.filter(s => 
    s.chapters.some(chapter => 
      chapter.originalParagraphs.some(p => p.trim())
    )
  );
};

const getTranslationProgress = (chapter: Chapter): number => {
  if (chapter.translatedParagraphs.length === 0) return 0;
  const translatedCount = chapter.translatedParagraphs.filter(p => p.trim()).length;
  return Math.round((translatedCount / chapter.originalParagraphs.length) * 100);
};

const getSeriesTranslationProgress = (series: Series): number => {
  const totalParagraphs = series.chapters.reduce((sum, c) => sum + c.originalParagraphs.length, 0);
  const translatedParagraphs = series.chapters.reduce(
    (sum, c) => sum + c.translatedParagraphs.filter(p => p.trim()).length,
    0
  );
  if (totalParagraphs === 0) return 0;
  return Math.round((translatedParagraphs / totalParagraphs) * 100);
};

const getSeriesWordCount = (series: Series): number => {
  return series.chapters.reduce((sum, c) => 
    sum + c.originalParagraphs.reduce((pSum, p) =>
      pSum + p.split(' ').length, 0
    ), 0
  );
};

const isSeriesFullySelected = (seriesId: string): boolean => {
  const seriesChapters = getTranslatedChapters(
    props.series.find(s => s.id === seriesId)?.chapters || []
  );
  const seriesChapterIds = seriesChapters.map(c => c.id);
  return seriesChapterIds.length > 0 && seriesChapterIds.every(id => props.selectedChapterIds.includes(id));
};

const getSelectedChaptersInSeries = (seriesId: string): number => {
  const seriesChapters = getTranslatedChapters(
    props.series.find(s => s.id === seriesId)?.chapters || []
  );
  const seriesChapterIds = seriesChapters.map(c => c.id);
  return seriesChapterIds.filter(id => props.selectedChapterIds.includes(id)).length;
};

const handleChapterToggle = (chapterId: string, checked: boolean) => {
  const newIds = checked 
    ? [...props.selectedChapterIds, chapterId]
    : props.selectedChapterIds.filter(id => id !== chapterId);
  emit('update:selectedChapterIds', newIds);
};

const handleSeriesToggle = (seriesId: string, checked: boolean) => {
  const newIds = checked 
    ? [...props.selectedSeriesIds, seriesId]
    : props.selectedSeriesIds.filter(id => id !== seriesId);
  emit('update:selectedSeriesIds', newIds);
};
</script>