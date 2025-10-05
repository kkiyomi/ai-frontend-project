<template>
  <div class="flex-1 overflow-y-auto">
    <!-- Series Management Header -->
    <SeriesHeader 
      :showAddChapterForm="showAddChapterForm"
      @createSeries="handleCreateSeries"
      @createChapter="handleCreateChapter"
      @cancelAddChapter="cancelAddChapter"
      @showAddChapter="showAddChapterForm = true"
    />

    <!-- Series List -->
    <div class="p-4">
      <!-- Empty State -->
      <div v-if="series.length === 0" class="text-center py-8">
        <div class="text-4xl mb-3">📚</div>
        <p class="text-sm text-gray-500">No series created yet</p>
        <p class="text-xs text-gray-400 mt-1">Create a series to organize your chapters</p>
      </div>

      <!-- Series Groups -->
      <div v-else class="space-y-4">
        <!-- Show all series when none selected -->
        <div v-if="!currentSeriesId" class="space-y-4">
          <SeriesCard
            v-for="seriesItem in series"
            :key="seriesItem.id"
            :series="toSeriesCardProps(seriesItem)"
            @select="toggleSeriesSelection"
            @edit="(s) => editSeries(seriesItem)"
            @delete="onRemoveSeries"
          />
        </div>

        <!-- Show only selected series when one is selected -->
        <SelectedSeriesView
          v-else-if="currentSeries"
          :key="currentSeries.id"
          :series="currentSeries"
          :currentChapterId="currentChapterId"
          @back="deselectSeries"
          @edit="editSeries"
          @delete="onRemoveSeries"
          @addChapter="showAddChapterForm = true"
          @selectChapter="selectChapter"
          @editChapter="handleChapterEdit"
          @deleteChapter="onRemoveChapter"
        />
      </div>
    </div>
  </div>

  <!-- Series Edit Modal -->
  <SeriesEditModal
    v-if="showEditModal && editingSeries"
    :series="editingSeries"
    @close="closeEditModal"
    @save="handleSeriesEdit"
  />

  <!-- Delete Confirmation Modal -->
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

  <!-- Chapter Delete Confirmation Modal -->
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
import { ref } from 'vue';
import SeriesHeader from './SeriesHeader.vue';
import { SeriesCard, type Series as SeriesCardType } from '@/modules/series';
import SelectedSeriesView from './SelectedSeriesView.vue';
import SeriesEditModal from './SeriesEditModal.vue';
import ConfirmationModal from './ConfirmationModal.vue';
import { useChapters } from '../composables/useChapters';
import { useDataAPI } from '../composables/useAPI';
import { useChaptersStore } from '@/modules/chapters';
import type { Series, Chapter } from '../types';

const {
  series,
  currentChapterId,
  currentSeriesId,
  currentSeries,
  createSeries,
  updateSeries,
  deleteSeries,
  selectSeriesOnly,
  selectChapter,
  removeChapter,
  addChapterFromText,
  updateChapter
} = useChapters();

const {
  updateSeries: updateSeriesAPI,
  deleteSeries: deleteSeriesAPI,
  createChapter: createChapterAPI,
  updateChapter: updateChapterAPI,
  deleteChapter: deleteChapterAPI
} = useDataAPI();

const chaptersStore = useChaptersStore();

// Helper function to convert global Series to SeriesCard props
const toSeriesCardProps = (series: Series): SeriesCardType => ({
  id: series.id,
  name: series.name,
  description: series.description,
  createdAt: series.createdAt,
  chapterIds: series.chapters.map(ch => ch.id)
});

// Component state
const showAddChapterForm = ref(false);
const showEditModal = ref(false);
const editingSeries = ref<Series | null>(null);
const showDeleteModal = ref(false);
const deletingSeries = ref<Series | null>(null);
const isDeletingSeries = ref(false);
const showDeleteChapterModal = ref(false);
const deletingChapter = ref<Chapter | null>(null);
const isDeletingChapter = ref(false);

// Series operations
const handleCreateSeries = (name: string) => {
  createSeries(name);
};

const toggleSeriesSelection = (seriesId: string) => {
  selectSeriesOnly(seriesId);
};

const deselectSeries = () => {
  selectSeriesOnly('');
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
    const response = await updateSeriesAPI(editingSeries.value.id, { name, description });
    
    if (response.success) {
      await updateSeries(editingSeries.value.id, { name, description });
      closeEditModal();
    } else {
      console.error('Failed to update series:', response.error);
    }
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
    const response = await deleteSeriesAPI(deletingSeries.value.id);
    
    if (response.success) {
      await deleteSeries(deletingSeries.value.id);
      closeDeleteModal();
    } else {
      console.error('Failed to delete series:', response.error);
    }
  } catch (error) {
    console.error('Error deleting series:', error);
  } finally {
    isDeletingSeries.value = false;
  }
};

// Chapter operations
const handleCreateChapter = async (title: string) => {
  if (!currentSeriesId.value) return;

  try {
    const emptyContent = `Chapter: ${title}\n\n[Add your content here...]`;

    const newChapter = await chaptersStore.createChapter({
      title,
      content: emptyContent,
      seriesId: currentSeriesId.value
    });

    if (newChapter) {
      await addChapterFromText(emptyContent, title, currentSeriesId.value);
    }

    showAddChapterForm.value = false;
  } catch (error) {
    console.error('Error creating chapter:', error);
  }
};

const cancelAddChapter = () => {
  showAddChapterForm.value = false;
};

const handleChapterEdit = async (chapter: Chapter) => {
  try {
    await chaptersStore.updateChapter(chapter.id, { title: chapter.title.trim() });
    await updateChapter(chapter.id, { title: chapter.title.trim() });
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
    removeChapter(deletingChapter.value.id);
    closeDeleteChapterModal();
  } catch (error) {
    console.error('Error deleting chapter:', error);
  } finally {
    isDeletingChapter.value = false;
  }
};
</script>