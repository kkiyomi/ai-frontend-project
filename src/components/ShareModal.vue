<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
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

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-6 space-y-6">

          <!-- Content Selection -->
          <ShareContentSelector
            :series="series"
            :selectedChapterIds="selectedChapterIds"
            :selectedSeriesIds="selectedSeriesIds"
            :searchQuery="chapterSearchQuery"
            @update:selectedChapterIds="selectedChapterIds = $event"
            @update:selectedSeriesIds="selectedSeriesIds = $event"
            @update:searchQuery="chapterSearchQuery = $event"
            @selectAllChapters="selectAllChapters"
            @clearAllChapters="clearAllChapters"
            @selectAllSeries="selectAllSeries"
            @clearAllSeries="clearAllSeries"
            @toggleSeriesSelection="toggleSeriesSelection"
          />

          <!-- Share Details -->
          <ShareDetailsForm
            v-if="hasValidSelection"
            :title="shareTitle"
            :description="shareDescription"
            :expiration="shareExpiration"
            :passwordProtected="sharePasswordProtected"
            :password="sharePassword"
            :defaultTitle="getDefaultTitle()"
            @update:title="shareTitle = $event"
            @update:description="shareDescription = $event"
            @update:expiration="shareExpiration = $event"
            @update:passwordProtected="sharePasswordProtected = $event"
            @update:password="sharePassword = $event"
          />

          <!-- Share Preview -->
          <SharePreview
            v-if="hasValidSelection"
            :contentSummary="getContentSummary()"
            :stats="shareStats"
            :expiration="shareExpiration"
            :passwordProtected="sharePasswordProtected"
          />

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              @click="$emit('close')"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleShare"
              :disabled="!hasValidSelection || isCreatingShare"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ isCreatingShare ? 'Creating...' : 'Create Share Link' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useChapters } from '../composables/useChapters';
import { useSharing } from '../composables/useSharing';
import ShareContentSelector from './ShareContentSelector.vue';
import ShareDetailsForm from './ShareDetailsForm.vue';
import SharePreview from './SharePreview.vue';
import type { ShareRequest, SharedContent, ShareStats } from '../types/sharing';
import type { Chapter, Series } from '../types';

const emit = defineEmits<{
  close: [];
  share: [request: ShareRequest];
}>();

const { series } = useChapters();
const { createShare } = useSharing();

// Create share form state
const selectedChapterIds = ref<string[]>([]);
const selectedSeriesIds = ref<string[]>([]);
const shareTitle = ref('');
const shareDescription = ref('');
const shareExpiration = ref('30');
const sharePasswordProtected = ref(false);
const sharePassword = ref('');
const isCreatingShare = ref(false);

// Search and filtering
const chapterSearchQuery = ref('');

// Manage shares state
const existingShares = ref<SharedContent[]>([]);
const showShareSettings = ref(false);
const selectedShare = ref<SharedContent | null>(null);
const extendDuration = ref('30');
const editPassword = ref('');

// Load existing shares
onMounted(() => {
  loadExistingShares();
});

const loadExistingShares = () => {
  // In a real app, this would fetch from API
  // For now, load from localStorage
  const shares: SharedContent[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('share-')) {
      try {
        const shareData = JSON.parse(localStorage.getItem(key) || '');
        shares.push(shareData);
      } catch (e) {
        // Invalid share data, skip
      }
    }
  }
  existingShares.value = shares.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Computed properties
const hasValidSelection = computed((): boolean => {
  return selectedChapterIds.value.length > 0 || selectedSeriesIds.value.length > 0;
});

const getSelectedChapters = (): Chapter[] => {
  const chaptersFromSeries = series.value
    .filter(s => selectedSeriesIds.value.includes(s.id))
    .flatMap(s => s.chapters.filter(c => isChapterFullyTranslated(c)));
  
  const individualChapters = getAllChapters().filter(c => 
    selectedChapterIds.value.includes(c.id) && 
    !selectedSeriesIds.value.includes(c.seriesId)
  );
  
  return [...chaptersFromSeries, ...individualChapters];
};

const isChapterFullyTranslated = (chapter: Chapter): boolean => {
  if (chapter.originalParagraphs.length === 0) return false;
  const translatedCount = chapter.translatedParagraphs.filter(p => p.trim()).length;
  return translatedCount === chapter.originalParagraphs.length;
};

const getSeriesCount = (): number => {
  const seriesFromSelection = selectedSeriesIds.value.length;
  const seriesFromChapters = new Set(
    selectedChapterIds.value
      .map(chapterId => getAllChapters().find(c => c.id === chapterId)?.seriesId)
      .filter(seriesId => seriesId && !selectedSeriesIds.value.includes(seriesId))
  ).size;
  
  return seriesFromSelection + seriesFromChapters;
};


const shareStats = computed((): ShareStats | null => {
  if (!hasValidSelection.value) return null;

  const chapters: Chapter[] = getSelectedChapters();
  const seriesCount: number = getSeriesCount();

  const totalParagraphs: number = chapters.reduce((sum, c) => sum + c.originalParagraphs.length, 0);
  const translatedParagraphs: number = chapters.reduce(
    (sum, c) => sum + c.translatedParagraphs.filter(p => p.trim()).length,
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

// Helper functions
const getAllChapters = () => {
  return series.value.flatMap(s => s.chapters);
};

const getTranslatedChapters = (chapters: Chapter[]) => {
  return chapters.filter(chapter =>
    chapter.originalParagraphs.some(p => p.trim())
  );
};

const getFilteredChapters = (chapters: Chapter[]) => {
  const translated = getTranslatedChapters(chapters);
  if (!chapterSearchQuery.value) return translated;

  return translated.filter(c =>
    c.title.toLowerCase().includes(chapterSearchQuery.value.toLowerCase())
  );
};

const getSeriesWithTranslations = () => {
  return series.value.filter(s =>
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

const getDefaultTitle = (): string => {
  if (selectedSeriesIds.value.length > 0 && selectedChapterIds.value.length === 0) {
    // Only series selected
    return selectedSeriesIds.value.length === 1 
      ? `${series.value.find(s => s.id === selectedSeriesIds.value[0])?.name || 'Series'} - Complete Translation`
      : `${selectedSeriesIds.value.length} Series - Translation Collection`;
  } else if (selectedSeriesIds.value.length === 0 && selectedChapterIds.value.length > 0) {
    // Only chapters selected
    return selectedChapterIds.value.length === 1
      ? `${getAllChapters().find(c => c.id === selectedChapterIds.value[0])?.title || 'Chapter'} - Translation`
      : `${selectedChapterIds.value.length} Chapters - Translation`;
  } else {
    // Mixed selection
    return 'Mixed Content - Translation';
  }
};

const getContentSummary = (): string => {
  if (!shareStats.value) return '';
  
  const { totalChapters, totalSeries, translationProgress } = shareStats.value;
  
  if (selectedSeriesIds.value.length > 0 && selectedChapterIds.value.length === 0) {
    // Only series selected
    return `${totalChapters} chapters from ${totalSeries} series (${translationProgress}% translated)`;
  } else if (selectedSeriesIds.value.length === 0 && selectedChapterIds.value.length > 0) {
    // Only chapters selected
    return `${totalChapters} individual chapters (${translationProgress}% translated)`;
  } else {
    // Mixed selection
    return `${totalChapters} chapters from ${totalSeries} series (${translationProgress}% translated)`;
  }
};

// Selection helpers
const selectAllChapters = () => {
  selectedChapterIds.value = getAllChapters()
    .filter(c => c.originalParagraphs.some(p => p.trim()))
    .map(c => c.id);
};

const clearAllChapters = () => {
  selectedChapterIds.value = [];
};

const selectAllSeries = () => {
  selectedSeriesIds.value = getSeriesWithTranslations().map(s => s.id);
};

const clearAllSeries = () => {
  selectedSeriesIds.value = [];
};

const toggleSeriesSelection = (seriesId: string) => {
  const seriesChapters = getTranslatedChapters(
    series.value.find(s => s.id === seriesId)?.chapters || []
  );
  const seriesChapterIds = seriesChapters.map(c => c.id);
  
  const allSelected = seriesChapterIds.every(id => selectedChapterIds.value.includes(id));
  
  if (allSelected) {
    selectedChapterIds.value = selectedChapterIds.value.filter(id => !seriesChapterIds.includes(id));
  } else {
    const newIds = seriesChapterIds.filter(id => !selectedChapterIds.value.includes(id));
    selectedChapterIds.value.push(...newIds);
  }
};

// Share management
const handleShare = async () => {
  if (!hasValidSelection.value) return;

  isCreatingShare.value = true;

  const request: ShareRequest = {
    chapterIds: selectedChapterIds.value,
    seriesIds: selectedSeriesIds.value,
    title: shareTitle.value || getDefaultTitle(),
    description: shareDescription.value || undefined,
    expirationDays: shareExpiration.value === '0' ? undefined : parseInt(shareExpiration.value),
    password: sharePasswordProtected.value ? sharePassword.value : undefined
  };

  try {
    const result = await createShare(request);
    if (result.success && result.data) {
      await navigator.clipboard.writeText(result.data.shareUrl);
      emit('close');
    }
  } catch (error) {
    console.error('Failed to create share:', error);
  } finally {
    isCreatingShare.value = false;
  }
};
</script>