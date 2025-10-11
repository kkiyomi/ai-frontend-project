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
            @edit="(s) => editSeries(seriesItem)"
            @delete="onRemoveSeries"
          />
        </div>
        <div v-else-if="currentSeries" class="border border-gray-200 rounded-lg overflow-hidden">
          <SelectedSeriesView
            :key="currentSeries.id"
            :series="currentSeries"
            @back="deselectSeries"
            @edit="editSeries"
            @delete="onRemoveSeries"
            @addChapter="handleCreateChapter('New Chapter!')"
          />

          <!-- Chapters List -->
          <ChaptersList
            :chapters="currentSeries.chapters"
            :currentChapterId="currentChapterId"
            @select="selectChapter"
            @edit="handleChapterEdit"
            @delete="onRemoveChapter"
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
    v-if="showDeleteModal && deletingSeries"
    title="Delete Series"
    :message="`Are you sure you want to delete '${deletingSeries.name}'?`"
    details="This action cannot be undone. All chapters in this series will also be deleted."
    type="danger"
    confirm-text="Delete Series"
    :is-processing="isDeletingSeries"
    processing-text="Deleting..."
    @confirm="confirmDeleteSeries"
    @cancel="closeDeleteModal"
  />

  <ConfirmationModal
    v-if="showDeleteChapterModal && deletingChapter"
    title="Delete Chapter"
    :message="`Are you sure you want to delete '${deletingChapter.title}'?`"
    details="This action cannot be undone. All translations for this chapter will be lost."
    type="danger"
    confirm-text="Delete Chapter"
    :is-processing="isDeletingChapter"
    processing-text="Deleting..."
    @confirm="confirmDeleteChapter"
    @cancel="closeDeleteChapterModal"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  SeriesCard,
  SeriesEditModal,
  useSeriesStore
} from '@/modules/series';
import { useChaptersStore } from '@/modules/chapters';
import { useSeriesWithChapters } from '@/composables';
import SeriesCreate from './SeriesCreate.vue';
import SelectedSeriesView from './SelectedSeriesView.vue';
import ChaptersList from './ChaptersList.vue';
import ConfirmationModal from './ConfirmationModal.vue';
import type { SeriesWithChapters as Series, Chapter } from '../types';

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
const showDeleteModal = ref(false);
const deletingSeries = ref<Series | null>(null);
const isDeletingSeries = ref(false);
const showDeleteChapterModal = ref(false);
const deletingChapter = ref<Chapter | null>(null);
const isDeletingChapter = ref(false);

const deselectSeries = () => {
  seriesStore.selectSeries(null);
  chaptersStore.selectChapter(null);
};

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

const onRemoveSeries = (seriesId: string) => {
  const seriesToDelete = series.value.find(s => s.id === seriesId);
  if (seriesToDelete) {
    deletingSeries.value = seriesToDelete;
    showDeleteModal.value = true;
  }
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingSeries.value = null;
  isDeletingSeries.value = false;
};

const confirmDeleteSeries = async () => {
  if (!deletingSeries.value) return;

  isDeletingSeries.value = true;

  try {
    await seriesStore.deleteSeries(deletingSeries.value.id);
    closeDeleteModal();
  } catch (error) {
    console.error('Error deleting series:', error);
  } finally {
    isDeletingSeries.value = false;
  }
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

const selectChapter = (chapterId: string) => {
  chaptersStore.selectChapter(chapterId);
};

const handleChapterEdit = async (chapter: Chapter) => {
  try {
    await chaptersStore.updateChapter(chapter.id, { title: chapter.title.trim() });
  } catch (error) {
    console.error('Error updating chapter:', error);
  }
};

const onRemoveChapter = (chapterId: string) => {
  const chapterToDelete = series.value
    .flatMap(s => s.chapters)
    .find(c => c.id === chapterId);

  if (chapterToDelete) {
    deletingChapter.value = chapterToDelete;
    showDeleteChapterModal.value = true;
  }
};

const closeDeleteChapterModal = () => {
  showDeleteChapterModal.value = false;
  deletingChapter.value = null;
  isDeletingChapter.value = false;
};

const confirmDeleteChapter = async () => {
  if (!deletingChapter.value) return;

  isDeletingChapter.value = true;

  try {
    await chaptersStore.deleteChapter(deletingChapter.value.id);
    closeDeleteChapterModal();
  } catch (error) {
    console.error('Error deleting chapter:', error);
  } finally {
    isDeletingChapter.value = false;
  }
};
</script>
