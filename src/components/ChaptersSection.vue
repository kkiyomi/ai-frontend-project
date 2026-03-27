<template>
  <div ref="chaptersScrollContainer" class="flex-1 overflow-y-auto min-h-0 pb-4">
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
            @edit="editSeries"
            @delete="() => deleteSeries(currentSeries)"
          />

          <!-- Chapters List -->
          <div>
            <div v-if="currentSeries.chapters.length === 0" class="p-4 text-center">
              <p class="text-xs text-gray-500">No chapters in this series</p>
              <p class="text-xs text-gray-400 mt-1">Upload files to add chapters</p>
            </div>

            <!-- Virtual scrolling container for large chapter lists -->
            <div v-else class="h-full">
              <!-- Chapter count indicator for large lists -->
              <div v-if="currentSeries.chapters.length > 50" class="p-2 bg-yellow-50 border-b border-yellow-200">
                <p class="text-xs text-yellow-700 text-center">
                  📚 {{ currentSeries.chapters.length }} chapters in this series
                </p>
              </div>

              <!-- Virtual scrolling for large lists -->
              <VirtualScrollingList
                :items="currentSeries.chapters"
                :visible-count="30"
                :buffer="5"
                :scroll-container="scrollContainerProp"
                item-key="id"
                class="divide-y divide-gray-100 flex-1"
              >
                <template #item="{ item }">
                  <ChapterItem
                    :chapter="item"
                    @delete="deleteChapter"
                  />
                </template>
              </VirtualScrollingList>
            </div>
          </div>
        </div>
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
import { useRouter } from 'vue-router';
import { VirtualScrollingList } from '@/modules/core';
import {
  SeriesCard,
  SeriesEditModal,
  useSeriesStore
} from '@/modules/series';
import { ChapterItem, useChaptersStore } from '@/modules/chapters';
import { useSeriesWithChapters, useConfirmation } from '@/composables';
import SeriesCreate from './SeriesCreate.vue';
import SelectedSeriesView from './SelectedSeriesView.vue';
import ConfirmationModal from './ConfirmationModal.vue';
import type { Series, Chapter } from '../types';

const router = useRouter();
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
      router.push('/');
    },
  });
};

const deleteChapter = (chapter: Chapter | null) => {
  if (!chapter) return;
  openConfirmation({
    title: 'Delete Chapter',
    message: `Are you sure you want to delete '${chapter.title}'?`,
    details: 'This action cannot be undone. All translations for this chapter will be lost.',
    type: 'danger',
    confirmText: 'Delete Chapter',
    action: async () => {
      await chaptersStore.deleteChapter(chapter.id);
      router.push(`/series/${chapter.seriesId}`);
    },
  });
};

const chaptersScrollContainer = ref<HTMLElement | null>(null);
const scrollContainerProp = computed(() => chaptersScrollContainer);

</script>
