<template>
  <div class="flex-1 overflow-y-auto">
    <SeriesCreate v-if="!currentSeriesId" @edit="editSeries" />
    <div class="p-4">
      <div v-if="series.length === 0" class="text-center py-8">
        <div class="text-4xl mb-3">📚</div>
        <p class="text-sm text-gray-500">No series created yet</p>
        <p class="text-xs text-gray-400 mt-1">Create a series to organize your chapters</p>
      </div>

      <div v-else class="space-y-4">
        <div v-if="!currentSeriesId" class="space-y-4">
          <SeriesCard
            v-for="seriesItem in series"
            :key="seriesItem.id"
            :series="seriesItem"
            @edit="() => editSeries(seriesItem)"
            @delete="() => deleteSeries(seriesItem)"
          />
        </div>
        <div v-else-if="currentSeries" class="border border-gray-200 rounded-lg overflow-hidden">
          <SelectedSeriesView
            :key="currentSeries.id"
            :series="currentSeries"
            @back="deselectSeries"
            @edit="editSeries"
            @delete="() => deleteSeries(currentSeries)"
            @addChapter="handleCreateChapter('New Chapter!')"
          />

          <!-- Chapters List -->
          <ChaptersList
            :chapters="currentSeries.chapters"
            :currentChapterId="currentChapterId"
            @delete="deleteChapter"
          />
        </div>
      </div>
    </div>
  </div>

  <SeriesEditModal
    v-if="showEditModal && editingSeries"
    :series="editingSeries"
    @close="closeEditModal"
    @save="handleSeriesEdit"
  />

  <ConfirmationModal
    v-if="showConfirmation"
    v-bind="confirmationData"
    @close="closeConfirmation"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  SeriesCard,
  SeriesEditModal,
  useSeriesStore
} from '@/modules/series';
import { ChaptersList, useChaptersStore } from '@/modules/chapters';
import { useSeriesWithChapters, useConfirmation } from '@/composables';
import SeriesCreate from './SeriesCreate.vue';
import SelectedSeriesView from './SelectedSeriesView.vue';
import ConfirmationModal from './ConfirmationModal.vue';
import type { Series, Chapter } from '../types';

const seriesStore = useSeriesStore();
const chaptersStore = useChaptersStore();

const currentSeriesId = computed(() => seriesStore.selectedSeriesId);
const currentChapterId = computed(() => chaptersStore.currentChapterId);

const {
  selectedSeriesWithChapters: currentSeries,
  allSeriesWithChapters: series
} = useSeriesWithChapters();

const showEditModal = ref(false);
const editingSeries = ref<Series | null>(null);

const editSeries = (series: Series) => {
  editingSeries.value = series;
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingSeries.value = null;
};

const handleSeriesEdit = async (name: string, description?: string) => {
  if (!editingSeries.value) return;

  try {
    await seriesStore.updateSeries(editingSeries.value.id, { name, description });
    closeEditModal();
  } catch (error) {
    console.error('Error updating series:', error);
  }
};

const {
  show: showConfirmation,
  modalData: confirmationData,
  open: openConfirmation,
  close: closeConfirmation
} = useConfirmation();

const deselectSeries = () => {
  seriesStore.selectSeries(null);
  chaptersStore.selectChapter(null);
};

const handleCreateChapter = async (title: string) => {
  if (!currentSeriesId.value) return;

  try {
    const emptyContent = `Chapter: ${title}\n\n[Add your content here...]`;

    await chaptersStore.createChapter({
      title,
      content: emptyContent,
      seriesId: currentSeriesId.value
    });

  } catch (error) {
    console.error('Error creating chapter:', error);
  }
};

const deleteSeries = (series: Series | null) => {
  if (!series) return;
  openConfirmation({
    title: 'Delete Series',
    message: `Are you sure you want to delete '${series.name}'?`,
    details: 'This action cannot be undone. All chapters in this series will also be deleted.',
    type: 'danger',
    confirmText: 'Delete Series',
    action: async () => {
      await seriesStore.deleteSeries(series.id);
    },
  });
};

const deleteChapter = (chapterId: string) => {
  if (!currentSeries.value) return;
  const chapter = currentSeries.value.chapters.find(c => c.id === chapterId);

  if (!chapter) {
    console.warn(`Chapter with ID '${chapterId}' not found`);
    return;
  }

  openConfirmation({
    title: 'Delete Chapter',
    message: `Are you sure you want to delete '${chapter.title}'?`,
    details: 'This action cannot be undone. All translations for this chapter will be lost.',
    type: 'danger',
    confirmText: 'Delete Chapter',
    action: async () => {
      await chaptersStore.deleteChapter(chapter.id);
    },
  });
};
</script>
