<template>
    <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-4 border-b border-base-300 flex-shrink-0">
            <h1 class="text-xl font-bold text-base-content mb-2">Absolute Mystery</h1>
            <p class="text-sm text-gray-600">Upload and manage your novel chapters</p>
        </div>

        <!-- Scrollable Content Area -->
        <div ref="chaptersScrollContainer" class="flex-1 overflow-y-auto min-h-0 pb-4">
          <div class="flex-1 overflow-y-auto">
            <SeriesCreate v-if="!currentSeries" @edit="editSeries" />
            <div class="p-4">
              <div v-if="series.length === 0" class="text-center py-8">
                <div class="text-4xl mb-3">📚</div>
                <p class="text-sm text-base-content/60">No series created yet</p>
                <p class="text-xs text-base-content/40 mt-1">Create a series to organize your chapters</p>
              </div>

              <div v-else class="space-y-4">
                <div v-if="!currentSeries" class="space-y-4">
                  <SeriesCard
                    v-for="seriesItem in series"
                    :key="seriesItem.id"
                    :series="seriesItem"
                    @edit="() => editSeries(seriesItem)"
                    @delete="() => deleteSeries(seriesItem)"
                  />
                </div>
                <div v-else-if="currentSeries" class="border border-base-300 rounded-lg overflow-hidden">
                  <SelectedSeriesView
                    :key="currentSeries.id"
                    :series="currentSeries"
                    @edit="editSeries"
                    @delete="() => deleteSeries(currentSeries)"
                  />

                  <!-- Chapters List -->
                  <div>
                    <div v-if="currentSeries.chapters.length === 0" class="p-4 text-center">
                      <p class="text-xs text-base-content/60">No chapters in this series</p>
                      <p class="text-xs text-base-content/40 mt-1">Upload files to add chapters</p>
                    </div>

                    <div v-else class="h-full">
                      <!-- Chapter count indicator for large lists -->
                      <div v-if="currentSeries.chapters.length > 50" class="p-2 bg-warning/10 border-b border-yellow-200">
                        <p class="text-xs text-yellow-700 text-center">
                          📚 {{ currentSeries.chapters.length }} chapters in this series
                        </p>
                      </div>

                      <!-- Chapters list -->
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
                            @delete="deleteChapter(item)"
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

        <!-- Footer Actions -->
        <div class="p-4 border-t border-base-300 flex-shrink-0 bg-base-100">
            <a v-if="!profileStore.isLoggedIn" href="https://absolutemystery.com/web/login?redirect=/r/app" target="_self" aria-label="Login"
                class="w-full flex items-center justify-center space-x-2 px-4 py-2 btn btn-primary transition-colors text-sm font-medium mb-3">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Login</span>
            </a>

            <button v-if="currentSeries" @click="glossaryStore.toggleVisibility"
                class="w-full flex btn btn-neutral space-x-2 px-4 py-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{{ glossaryStore.isGlossaryVisible ? "Hide" : "Show" }} Glossary</span>
            </button>

            <div class="mt-3 text-center">
                <p class="text-xs text-base-content/60">{{ getTotalStats() }}</p>
            </div>
        </div>
    </div>
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
import { useGlossaryStore } from '@/modules/glossary';
import { useProfileStore } from '@/modules/profile';
import { useSeriesWithChapters, useConfirmation } from '@/composables';
import SeriesCreate from './SeriesCreate.vue';
import SelectedSeriesView from './SelectedSeriesView.vue';
import ConfirmationModal from './ConfirmationModal.vue';
import type { Series, Chapter } from '../types';

const router = useRouter();

const seriesStore = useSeriesStore();
const chaptersStore = useChaptersStore();
const glossaryStore = useGlossaryStore();
const profileStore = useProfileStore();

const {
  selectedSeriesWithChapters: currentSeries,
  allSeriesWithChapters: series,
  getTotalStats
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