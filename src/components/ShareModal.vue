<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Share Your Translations</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Share Type Selection -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">What would you like to share?</h3>
        <div class="space-y-3">
          <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              v-model="shareType"
              type="radio"
              value="chapter"
              class="mt-1 text-purple-600 focus:ring-purple-500"
            />
            <div class="flex-1">
              <div class="font-medium text-gray-900">Single Chapter</div>
              <div class="text-sm text-gray-500">Share one specific chapter</div>
            </div>
          </label>

          <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              v-model="shareType"
              type="radio"
              value="chapters"
              class="mt-1 text-purple-600 focus:ring-purple-500"
            />
            <div class="flex-1">
              <div class="font-medium text-gray-900">Multiple Chapters</div>
              <div class="text-sm text-gray-500">Select specific chapters to share</div>
            </div>
          </label>

          <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              v-model="shareType"
              type="radio"
              value="series"
              class="mt-1 text-purple-600 focus:ring-purple-500"
            />
            <div class="flex-1">
              <div class="font-medium text-gray-900">Complete Series</div>
              <div class="text-sm text-gray-500">Share all chapters from one series</div>
            </div>
          </label>

          <label class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              v-model="shareType"
              type="radio"
              value="multiple-series"
              class="mt-1 text-purple-600 focus:ring-purple-500"
            />
            <div class="flex-1">
              <div class="font-medium text-gray-900">Multiple Series</div>
              <div class="text-sm text-gray-500">Share multiple complete series</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Content Selection -->
      <div v-if="shareType" class="mb-6">
        <!-- Single Chapter Selection -->
        <div v-if="shareType === 'chapter'" class="space-y-3">
          <h4 class="font-medium text-gray-900">Select Chapter</h4>
          <select
            v-model="selectedChapterId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Choose a chapter...</option>
            <optgroup v-for="seriesItem in series" :key="seriesItem.id" :label="seriesItem.name">
              <option
                v-for="chapter in getTranslatedChapters(seriesItem.chapters)"
                :key="chapter.id"
                :value="chapter.id"
              >
                {{ chapter.title }} ({{ getTranslationProgress(chapter) }}% translated)
              </option>
            </optgroup>
          </select>
        </div>

        <!-- Multiple Chapters Selection -->
        <div v-if="shareType === 'chapters'" class="space-y-3">
          <h4 class="font-medium text-gray-900">Select Chapters</h4>
          <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <div v-for="seriesItem in series" :key="seriesItem.id" class="border-b border-gray-100 last:border-b-0">
              <div class="p-3 bg-gray-50 font-medium text-gray-900">{{ seriesItem.name }}</div>
              <div class="divide-y divide-gray-100">
                <label
                  v-for="chapter in getTranslatedChapters(seriesItem.chapters)"
                  :key="chapter.id"
                  class="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    v-model="selectedChapterIds"
                    type="checkbox"
                    :value="chapter.id"
                    class="text-purple-600 focus:ring-purple-500"
                  />
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">{{ chapter.title }}</div>
                    <div class="text-xs text-gray-500">{{ getTranslationProgress(chapter) }}% translated</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <p class="text-sm text-gray-500">{{ selectedChapterIds.length }} chapters selected</p>
        </div>

        <!-- Series Selection -->
        <div v-if="shareType === 'series'" class="space-y-3">
          <h4 class="font-medium text-gray-900">Select Series</h4>
          <select
            v-model="selectedSeriesId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Choose a series...</option>
            <option
              v-for="seriesItem in getSeriesWithTranslations()"
              :key="seriesItem.id"
              :value="seriesItem.id"
            >
              {{ seriesItem.name }} ({{ getSeriesTranslationProgress(seriesItem) }}% translated, {{ seriesItem.chapters.length }} chapters)
            </option>
          </select>
        </div>

        <!-- Multiple Series Selection -->
        <div v-if="shareType === 'multiple-series'" class="space-y-3">
          <h4 class="font-medium text-gray-900">Select Series</h4>
          <div class="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            <label
              v-for="seriesItem in getSeriesWithTranslations()"
              :key="seriesItem.id"
              class="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
            >
              <input
                v-model="selectedSeriesIds"
                type="checkbox"
                :value="seriesItem.id"
                class="text-purple-600 focus:ring-purple-500"
              />
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-900">{{ seriesItem.name }}</div>
                <div class="text-xs text-gray-500">
                  {{ getSeriesTranslationProgress(seriesItem) }}% translated • {{ seriesItem.chapters.length }} chapters
                </div>
              </div>
            </label>
          </div>
          <p class="text-sm text-gray-500">{{ selectedSeriesIds.length }} series selected</p>
        </div>
      </div>

      <!-- Share Details -->
      <div v-if="shareType && hasValidSelection" class="mb-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Share Title (optional)</label>
          <input
            v-model="shareTitle"
            type="text"
            :placeholder="getDefaultTitle()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
          <textarea
            v-model="shareDescription"
            rows="3"
            placeholder="Add a description for your shared content..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Share Preview -->
      <div v-if="shareType && hasValidSelection" class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-medium text-gray-900 mb-2">Share Preview</h4>
        <div class="text-sm text-gray-600 space-y-1">
          <p><strong>Type:</strong> {{ getShareTypeLabel() }}</p>
          <p><strong>Content:</strong> {{ getContentSummary() }}</p>
          <p v-if="shareStats"><strong>Progress:</strong> {{ shareStats.translatedParagraphs }}/{{ shareStats.totalParagraphs }} paragraphs translated ({{ shareStats.translationProgress }}%)</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleShare"
          :disabled="!hasValidSelection"
          class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Create Share Link
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useChapters } from '../composables/useChapters';
import type { ShareRequest } from '../types/sharing';
import type { Chapter, Series } from '../types';

const emit = defineEmits<{
  close: [];
  share: [request: ShareRequest];
}>();

const { series } = useChapters();

const shareType = ref<'chapter' | 'chapters' | 'series' | 'multiple-series'>('chapter');
const selectedChapterId = ref('');
const selectedChapterIds = ref<string[]>([]);
const selectedSeriesId = ref('');
const selectedSeriesIds = ref<string[]>([]);
const shareTitle = ref('');
const shareDescription = ref('');

const hasValidSelection = computed(() => {
  switch (shareType.value) {
    case 'chapter':
      return !!selectedChapterId.value;
    case 'chapters':
      return selectedChapterIds.value.length > 0;
    case 'series':
      return !!selectedSeriesId.value;
    case 'multiple-series':
      return selectedSeriesIds.value.length > 0;
    default:
      return false;
  }
});

const shareStats = computed(() => {
  if (!hasValidSelection.value) return null;

  let chapters: Chapter[] = [];
  let seriesCount = 0;

  switch (shareType.value) {
    case 'chapter':
      const chapter = getAllChapters().find(c => c.id === selectedChapterId.value);
      if (chapter) chapters = [chapter];
      seriesCount = 1;
      break;
    case 'chapters':
      chapters = getAllChapters().filter(c => selectedChapterIds.value.includes(c.id));
      seriesCount = new Set(chapters.map(c => c.seriesId)).size;
      break;
    case 'series':
      const selectedSeries = series.value.find(s => s.id === selectedSeriesId.value);
      if (selectedSeries) {
        chapters = selectedSeries.chapters;
        seriesCount = 1;
      }
      break;
    case 'multiple-series':
      chapters = series.value
        .filter(s => selectedSeriesIds.value.includes(s.id))
        .flatMap(s => s.chapters);
      seriesCount = selectedSeriesIds.value.length;
      break;
  }

  const totalParagraphs = chapters.reduce((sum, c) => sum + c.paragraphs.length, 0);
  const translatedParagraphs = chapters.reduce(
    (sum, c) => sum + c.paragraphs.filter(p => p.translatedText.trim()).length,
    0
  );

  return {
    totalChapters: chapters.length,
    totalSeries: seriesCount,
    totalParagraphs,
    translatedParagraphs,
    translationProgress: totalParagraphs > 0 ? Math.round((translatedParagraphs / totalParagraphs) * 100) : 0
  };
});

const getAllChapters = () => {
  return series.value.flatMap(s => s.chapters);
};

const getTranslatedChapters = (chapters: Chapter[]) => {
  return chapters.filter(chapter => 
    chapter.paragraphs.some(p => p.translatedText.trim())
  );
};

const getSeriesWithTranslations = () => {
  return series.value.filter(s => 
    s.chapters.some(chapter => 
      chapter.paragraphs.some(p => p.translatedText.trim())
    )
  );
};

const getTranslationProgress = (chapter: Chapter): number => {
  if (chapter.paragraphs.length === 0) return 0;
  const translatedCount = chapter.paragraphs.filter(p => p.translatedText.trim()).length;
  return Math.round((translatedCount / chapter.paragraphs.length) * 100);
};

const getSeriesTranslationProgress = (series: Series): number => {
  const totalParagraphs = series.chapters.reduce((sum, c) => sum + c.paragraphs.length, 0);
  const translatedParagraphs = series.chapters.reduce(
    (sum, c) => sum + c.paragraphs.filter(p => p.translatedText.trim()).length,
    0
  );
  if (totalParagraphs === 0) return 0;
  return Math.round((translatedParagraphs / totalParagraphs) * 100);
};

const getDefaultTitle = (): string => {
  switch (shareType.value) {
    case 'chapter':
      const chapter = getAllChapters().find(c => c.id === selectedChapterId.value);
      return chapter ? `${chapter.title} - Translation` : 'Chapter Translation';
    case 'chapters':
      return `${selectedChapterIds.value.length} Chapters - Translation`;
    case 'series':
      const selectedSeries = series.value.find(s => s.id === selectedSeriesId.value);
      return selectedSeries ? `${selectedSeries.name} - Complete Translation` : 'Series Translation';
    case 'multiple-series':
      return `${selectedSeriesIds.value.length} Series - Translation Collection`;
    default:
      return 'Translation Share';
  }
};

const getShareTypeLabel = (): string => {
  const labels = {
    chapter: 'Single Chapter',
    chapters: 'Multiple Chapters',
    series: 'Complete Series',
    'multiple-series': 'Multiple Series'
  };
  return labels[shareType.value];
};

const getContentSummary = (): string => {
  if (!shareStats.value) return '';
  
  const { totalChapters, totalSeries, translationProgress } = shareStats.value;
  
  if (totalSeries === 1) {
    return `${totalChapters} chapter${totalChapters !== 1 ? 's' : ''} (${translationProgress}% translated)`;
  } else {
    return `${totalChapters} chapters across ${totalSeries} series (${translationProgress}% translated)`;
  }
};

const handleShare = () => {
  if (!hasValidSelection.value) return;

  const request: ShareRequest = {
    type: shareType.value,
    title: shareTitle.value || getDefaultTitle(),
    description: shareDescription.value || undefined
  };

  switch (shareType.value) {
    case 'chapter':
      request.chapterIds = [selectedChapterId.value];
      break;
    case 'chapters':
      request.chapterIds = selectedChapterIds.value;
      break;
    case 'series':
      request.seriesIds = [selectedSeriesId.value];
      break;
    case 'multiple-series':
      request.seriesIds = selectedSeriesIds.value;
      break;
  }

  emit('share', request);
};

// Reset selections when share type changes
watch(shareType, () => {
  selectedChapterId.value = '';
  selectedChapterIds.value = [];
  selectedSeriesId.value = '';
  selectedSeriesIds.value = [];
  shareTitle.value = '';
  shareDescription.value = '';
});
</script>