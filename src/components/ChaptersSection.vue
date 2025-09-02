<template>
    <div class="flex-1 overflow-y-auto">
        <!-- Series Management Header -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-900">Series</h3>
                <button @click="showAddSeriesForm = !showAddSeriesForm"
                    class="text-xs text-blue-600 hover:text-blue-700 transition-colors">
                    {{ showAddSeriesForm ? 'Cancel' : '+ New' }}
                </button>
            </div>

            <!-- Add Series Form -->
            <div v-if="showAddSeriesForm" class="space-y-2">
                <input v-model="newSeriesName" type="text" placeholder="Series name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    @keyup.enter="handleCreateSeries" />
                <div class="flex space-x-2">
                    <button @click="handleCreateSeries" :disabled="!newSeriesName.trim()"
                        class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors">
                        Save
                    </button>
                </div>
            </div>
        </div>

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
                <div v-for="seriesItem in series" :key="seriesItem.id"
                    class="border border-gray-200 rounded-lg overflow-hidden">
                    <!-- Series Header -->
                    <div class="bg-gray-50 p-3 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <div class="flex-1 min-w-0 cursor-pointer" @click="selectSeriesOnly(seriesItem.id)" :class="{ 'opacity-100': currentSeriesId === seriesItem.id }">
                                <h4 class="text-sm font-semibold text-gray-900 truncate">{{ seriesItem.name }}</h4>
                                <p v-if="seriesItem.description" class="text-xs text-gray-500 mt-1">{{
                                    seriesItem.description }}</p>
                                <div class="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                                    <span>{{ seriesItem.chapters.length }} chapters</span>
                                    <span>{{ getSeriesTranslationProgress(seriesItem) }}% translated</span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-1">
                                <button @click.stop="selectSeriesOnly(seriesItem.id)"
                                    class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    :class="{ 'text-blue-600': currentSeriesId === seriesItem.id }"
                                    title="Select series">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <BulkChapterUpload :seriesId="seriesItem.id" />
                                <button @click.stop="onRemoveSeries(seriesItem.id)"
                                    class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove series">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <!-- Series Progress Bar -->
                        <div class="mt-2">
                            <div class="bg-gray-200 rounded-full h-1">
                                <div class="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                    :style="{ width: `${getSeriesTranslationProgress(seriesItem)}%` }" />
                            </div>
                        </div>
                    </div>

                    <!-- Chapters in Series -->
                    <div v-if="seriesItem.chapters.length === 0" class="p-4 text-center">
                        <p class="text-xs text-gray-500">No chapters in this series</p>
                        <p class="text-xs text-gray-400 mt-1">Upload files to add chapters</p>
                    </div>

                    <div v-else class="divide-y divide-gray-100">
                        <div v-for="chapter in seriesItem.chapters" :key="chapter.id" @click="selectChapter(chapter.id)"
                            class="group relative p-3 cursor-pointer transition-all hover:bg-blue-50" :class="{
                                'bg-blue-50 border-l-4 border-blue-500': currentChapterId === chapter.id,
                            }">
                            <div class="flex items-start justify-between">
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center space-x-2 mb-1">
                                        <span class="text-sm">{{ getFileIcon(chapter.title) }}</span>
                                        <h5 class="text-sm font-medium text-gray-900 truncate">
                                            {{ chapter.title }}
                                        </h5>
                                    </div>
                                    <p class="text-xs text-gray-500">
                                        {{ chapter.paragraphs.length }} paragraphs
                                    </p>
                                    <div class="mt-1 flex items-center space-x-3 text-xs text-gray-400">
                                        <span>{{ getTranslationProgress(chapter) }}% translated</span>
                                        <span>{{ formatFileSize(chapter.content.length) }}</span>
                                    </div>
                                </div>

                                <button @click.stop="onRemoveChapter(chapter.id)"
                                    class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                    title="Remove chapter">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <!-- Chapter Progress Bar -->
                            <div class="mt-2">
                                <div class="bg-gray-200 rounded-full h-1">
                                    <div class="bg-green-500 h-1 rounded-full transition-all duration-300"
                                        :style="{ width: `${getTranslationProgress(chapter)}%` }" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import BulkChapterUpload from './BulkChapterUpload.vue';
import { ref } from 'vue';
import { useChapters } from '../composables/useChapters';
import { getFileIcon } from '../utils/fileParser';
import type { Chapter, Series } from '../types';

const {
    series,
    currentChapterId,
    currentSeriesId,
    createSeries,
    removeSeries,
    selectSeriesOnly,
    selectChapter,
    removeChapter
} = useChapters();

const showAddSeriesForm = ref(false);
const newSeriesName = ref('');
const newSeriesDescription = ref('');

const handleCreateSeries = () => {
    console.log('handleCreateSeries');
    if (!newSeriesName.value.trim()) return;

    createSeries(newSeriesName.value.trim(), newSeriesDescription.value.trim() || undefined);

    // Reset form
    newSeriesName.value = '';
    newSeriesDescription.value = '';
    showAddSeriesForm.value = false;
};

// Removed unused cancelAddSeries handler

const onRemoveSeries = (seriesId: string) => {
    console.log('onRemoveSeries');
    removeSeries(seriesId);
};

const onRemoveChapter = (chapterId: string) => {
    console.log('onRemoveChapter');
    removeChapter(chapterId);
};

const getSeriesTranslationProgress = (series: Series): number => {
    if (series.chapters.length === 0) return 0;

    const totalParagraphs = series.chapters.reduce((sum, chapter) => sum + chapter.paragraphs.length, 0);
    const translatedParagraphs = series.chapters.reduce(
        (sum, chapter) => sum + chapter.paragraphs.filter(p => p.translatedText.trim()).length,
        0
    );

    if (totalParagraphs === 0) return 0;
    return Math.round((translatedParagraphs / totalParagraphs) * 100);
};

const getTranslationProgress = (chapter: Chapter): number => {
    if (chapter.paragraphs.length === 0) return 0;
    const translatedCount = chapter.paragraphs.filter((p) =>
        p.translatedText.trim()
    ).length;
    return Math.round((translatedCount / chapter.paragraphs.length) * 100);
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
</script>