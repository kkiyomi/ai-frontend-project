<template>
  <div class="space-y-4">
    <div>
      <h4 class="font-medium text-gray-900 mb-3">Select Content to Share</h4>

      <!-- Bulk Actions -->
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <button
            @click="selectAllSeries"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            Select All Series
          </button>
          <span class="text-gray-300">|</span>
          <button
            @click="clearAllSelections"
            class="text-sm text-gray-600 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
        <div class="text-sm text-gray-500">{{ totalSelectedCount }} selected</div>
      </div>

      <!-- Search -->
      <div class="mb-3">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Search series and chapters..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      <!-- Selection List -->
      <div class="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
        <div v-for="seriesItem in filteredSeries" :key="seriesItem.id" class="border-b border-gray-100 last:border-b-0">
          <!-- Series Header -->
          <div class="p-3 bg-gray-50 font-medium text-gray-900 text-sm flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <input
                :checked="isSeriesSelected(seriesItem.id)"
                @change="toggleSeriesSelection(seriesItem.id, ($event.target as HTMLInputElement).checked)"
                type="checkbox"
                class="text-blue-600 focus:ring-blue-500"
              />
              <span>{{ seriesItem.name }}</span>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-xs text-gray-500">
                {{ getSeriesTranslationProgress(seriesItem) }}% translated • {{ getTranslatedChapters(seriesItem.chapters).length }} chapters
              </span>
              <button
                @click="toggleSeriesExpansion(seriesItem.id)"
                class="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded"
              >
                {{ isSeriesExpanded(seriesItem.id) ? 'Collapse' : 'Expand' }}
              </button>
            </div>
          </div>

          <!-- Chapter List (when expanded) -->
          <div v-if="isSeriesExpanded(seriesItem.id)" class="divide-y divide-gray-100 bg-white">
            <label
              v-for="chapter in getFilteredChapters(seriesItem.chapters)"
              :key="chapter.id"
              class="flex items-center space-x-3 p-3 pl-8 hover:bg-gray-50 cursor-pointer"
            >
              <input
                :value="chapter.id"
                :checked="isChapterSelected(chapter.id)"
                @change="toggleChapterSelection(chapter.id, seriesItem.id, ($event.target as HTMLInputElement).checked)"
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Series, Chapter } from '@/types';

interface Props {
  series: Series[];
  searchQuery?: string;
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: ''
});

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

// Internal state
const selectedSeriesIds = ref<string[]>([]);
const selectedChapterIds = ref<string[]>([]);
const expandedSeriesIds = ref<string[]>([]);

// Computed properties
const filteredSeries = computed(() => {
  if (!props.searchQuery) return getSeriesWithTranslations();

  const query = props.searchQuery.toLowerCase();
  return getSeriesWithTranslations().filter(s => {
    const seriesMatches = s.name.toLowerCase().includes(query);
    const chapterMatches = s.chapters.some(c =>
      c.title.toLowerCase().includes(query)
    );
    return seriesMatches || chapterMatches;
  });
});

const totalSelectedCount = computed(() => {
  const seriesCount = selectedSeriesIds.value.length;
  const individualChaptersCount = selectedChapterIds.value.filter(chapterId => {
    const chapter = getAllChapters().find(c => c.id === chapterId);
    return chapter && !selectedSeriesIds.value.includes(chapter.seriesId || '');
  }).length;

  return seriesCount + individualChaptersCount;
});

// Selection logic
const isSeriesSelected = (seriesId: string): boolean => {
  return selectedSeriesIds.value.includes(seriesId);
};

const isChapterSelected = (chapterId: string): boolean => {
  const chapter = getAllChapters().find(c => c.id === chapterId);
  if (!chapter) return false;

  // If the whole series is selected, chapter is automatically selected
  if (selectedSeriesIds.value.includes(chapter.seriesId || '')) return true;

  // Otherwise check individual chapter selection
  return selectedChapterIds.value.includes(chapterId);
};

const isSeriesExpanded = (seriesId: string): boolean => {
  return expandedSeriesIds.value.includes(seriesId);
};

const toggleSeriesSelection = (seriesId: string, checked: boolean) => {
  if (checked) {
    if (!selectedSeriesIds.value.includes(seriesId)) {
      selectedSeriesIds.value.push(seriesId);
    }
    // Remove individual chapters from this series since whole series is selected
    const seriesChapters = getTranslatedChapters(
      props.series.find(s => s.id === seriesId)?.chapters || []
    );
    selectedChapterIds.value = selectedChapterIds.value.filter(
      chapterId => !seriesChapters.some(c => c.id === chapterId)
    );
  } else {
    selectedSeriesIds.value = selectedSeriesIds.value.filter(id => id !== seriesId);
  }

  emit('update:selectedSeriesIds', [...selectedSeriesIds.value]);
  emit('update:selectedChapterIds', [...selectedChapterIds.value]);
};

const toggleChapterSelection = (chapterId: string, seriesId: string, checked: boolean) => {
  if (checked) {
    // If series is selected, unselect it first
    if (selectedSeriesIds.value.includes(seriesId)) {
      selectedSeriesIds.value = selectedSeriesIds.value.filter(id => id !== seriesId);
      // Add all other chapters from this series
      const seriesChapters = getTranslatedChapters(
        props.series.find(s => s.id === seriesId)?.chapters || []
      );
      seriesChapters.forEach(chapter => {
        if (chapter.id !== chapterId && !selectedChapterIds.value.includes(chapter.id)) {
          selectedChapterIds.value.push(chapter.id);
        }
      });
    }

    if (!selectedChapterIds.value.includes(chapterId)) {
      selectedChapterIds.value.push(chapterId);
    }
  } else {
    selectedChapterIds.value = selectedChapterIds.value.filter(id => id !== chapterId);
  }

  emit('update:selectedSeriesIds', [...selectedSeriesIds.value]);
  emit('update:selectedChapterIds', [...selectedChapterIds.value]);
};

const toggleSeriesExpansion = (seriesId: string) => {
  if (expandedSeriesIds.value.includes(seriesId)) {
    expandedSeriesIds.value = expandedSeriesIds.value.filter(id => id !== seriesId);
  } else {
    expandedSeriesIds.value.push(seriesId);
  }
};

const selectAllSeries = () => {
  const allSeriesIds = getSeriesWithTranslations().map(s => s.id);
  emit('update:selectedSeriesIds', allSeriesIds);
  emit('update:selectedChapterIds', []);
};

const clearAllSelections = () => {
  emit('update:selectedSeriesIds', []);
  emit('update:selectedChapterIds', []);
};

// Helper functions
const getAllChapters = (): (Chapter & { seriesId?: string })[] => {
  return props.series.flatMap(s =>
    s.chapters.map(c => ({ ...c, seriesId: s.id }))
  );
};

const getTranslatedChapters = (chapters: Chapter[]) => {
  return chapters.filter(chapter =>
    chapter.translatedParagraphs.some(p => p.trim())
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
      chapter.translatedParagraphs.some(p => p.trim())
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
</script>