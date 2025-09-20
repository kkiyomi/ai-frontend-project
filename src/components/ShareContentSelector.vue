<template>
  <div class="space-y-4">
    <div>
      <h4 class="font-medium text-gray-900 mb-3">{{ title }}</h4>

      <!-- Bulk Actions -->
      <div v-if="isMultiSelect" class="mb-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <button
            @click="handleSelectAll"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            Select All
          </button>
          <span class="text-gray-300">|</span>
          <button
            @click="handleClearAll"
            class="text-sm text-gray-600 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
        <div class="text-sm text-gray-500">{{ selectedCount }} selected</div>
      </div>

      <!-- Search -->
      <div v-if="showSearch" class="mb-3">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Search chapters..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      <!-- Selection List -->
      <div :class="containerClass">
        <!-- Chapter Selection (grouped by series) -->
        <div v-if="isChapterMode" v-for="seriesItem in displayData" :key="seriesItem.id" class="border-b border-gray-100 last:border-b-0">
          <div class="p-3 bg-gray-50 font-medium text-gray-900 text-sm flex items-center justify-between">
            <span>{{ seriesItem.name }}</span>
            <div v-if="isMultiSelect" class="flex items-center space-x-2">
              <button
                @click="toggleSeriesSelection(seriesItem.id)"
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
              v-for="chapter in getDisplayChapters(seriesItem.chapters)"
              :key="chapter.id"
              class="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
            >
              <input
                :value="chapter.id"
                :checked="isSelected(chapter.id)"
                @change="handleToggle(chapter.id, ($event.target as HTMLInputElement).checked)"
                :type="inputType"
                class="text-blue-600 focus:ring-blue-500"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">{{ chapter.title }}</div>
                <div class="text-xs text-gray-500">{{ getTranslationProgress(chapter) }}% translated • {{ chapter.originalParagraphs.length }} paragraphs</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Series Selection (direct) -->
        <div v-else class="divide-y divide-gray-100">
          <label
            v-for="seriesItem in displayData"
            :key="seriesItem.id"
            :class="isMultiSelect ?
              'flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer' :
              'flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer mb-2'"
          >
            <input
              :value="seriesItem.id"
              :checked="isSelected(seriesItem.id)"
              @change="handleToggle(seriesItem.id, ($event.target as HTMLInputElement).checked)"
              :type="inputType"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Series, Chapter } from '../types';

interface Props {
  series: Series[];
  selectedChapterId?: string;
  selectedChapterIds?: string[];
  selectedSeriesId?: string;
  selectedSeriesIds?: string[];
  searchQuery?: string;
}

const props = withDefaults(defineProps<Props>(), {
  selectedChapterId: '',
  selectedChapterIds: () => [],
  selectedSeriesId: '',
  selectedSeriesIds: () => [],
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

// Determine mode based on which props are provided
const isChapterMode = computed(() =>
  props.selectedChapterId !== undefined || props.selectedChapterIds !== undefined
);

const isMultiSelect = computed(() =>
  props.selectedChapterIds !== undefined || props.selectedSeriesIds !== undefined
);

const showSearch = computed(() =>
  isChapterMode.value && isMultiSelect.value
);

// Dynamic computed properties
const title = computed(() => {
  if (isChapterMode.value) {
    return isMultiSelect.value ? 'Select Chapters' : 'Select Chapter';
  }
  return 'Select Series';
});

const inputType = computed(() => isMultiSelect.value ? 'checkbox' : 'radio');

const containerClass = computed(() => {
  if (isChapterMode.value) {
    return isMultiSelect.value
      ? 'max-h-80 overflow-y-auto border border-gray-200 rounded-lg'
      : 'max-h-64 overflow-y-auto border border-gray-200 rounded-lg';
  }
  return isMultiSelect.value
    ? 'max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100'
    : 'space-y-2';
});

const selectedCount = computed(() => {
  if (isChapterMode.value) {
    return props.selectedChapterIds?.length || 0;
  }
  return props.selectedSeriesIds?.length || 0;
});

// Data filtering and display
const displayData = computed(() => {
  const baseData = isChapterMode.value
    ? props.series
    : getSeriesWithTranslations();

  if (!showSearch.value || !props.searchQuery) {
    return baseData;
  }

  // Filter for chapter search
  return baseData.map(s => ({
    ...s,
    chapters: s.chapters.filter(c =>
      c.title.toLowerCase().includes(props.searchQuery.toLowerCase())
    )
  })).filter(s => s.chapters.length > 0);
});

// Unified selection logic
const isSelected = (id: string): boolean => {
  if (isChapterMode.value) {
    return isMultiSelect.value
      ? (props.selectedChapterIds || []).includes(id)
      : props.selectedChapterId === id;
  }
  return isMultiSelect.value
    ? (props.selectedSeriesIds || []).includes(id)
    : props.selectedSeriesId === id;
};

const handleToggle = (id: string, checked: boolean) => {
  if (isChapterMode.value) {
    if (isMultiSelect.value) {
      const currentIds = props.selectedChapterIds || [];
      const newIds = checked
        ? [...currentIds, id]
        : currentIds.filter(selectedId => selectedId !== id);
      emit('update:selectedChapterIds', newIds);
    } else {
      emit('update:selectedChapterId', id);
    }
  } else {
    if (isMultiSelect.value) {
      const currentIds = props.selectedSeriesIds || [];
      const newIds = checked
        ? [...currentIds, id]
        : currentIds.filter(selectedId => selectedId !== id);
      emit('update:selectedSeriesIds', newIds);
    } else {
      emit('update:selectedSeriesId', id);
    }
  }
};

const handleSelectAll = () => {
  if (isChapterMode.value) {
    emit('selectAllChapters');
  } else {
    emit('selectAllSeries');
  }
};

const handleClearAll = () => {
  if (isChapterMode.value) {
    emit('clearAllChapters');
  } else {
    emit('clearAllSeries');
  }
};

const toggleSeriesSelection = (seriesId: string) => {
  emit('toggleSeriesSelection', seriesId);
};

// Helper functions
const getTranslatedChapters = (chapters: Chapter[]) => {
  return chapters.filter(chapter =>
    chapter.originalParagraphs.some(p => p.trim())
  );
};

const getDisplayChapters = (chapters: Chapter[]) => {
  const translated = getTranslatedChapters(chapters);
  if (!showSearch.value || !props.searchQuery) {
    return translated;
  }

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
  const selectedIds = props.selectedChapterIds || [];
  return seriesChapterIds.length > 0 && seriesChapterIds.every(id => selectedIds.includes(id));
};

const getSelectedChaptersInSeries = (seriesId: string): number => {
  const seriesChapters = getTranslatedChapters(
    props.series.find(s => s.id === seriesId)?.chapters || []
  );
  const seriesChapterIds = seriesChapters.map(c => c.id);
  const selectedIds = props.selectedChapterIds || [];
  return seriesChapterIds.filter(id => selectedIds.includes(id)).length;
};
</script>