<template>
    <div class="flex-1 overflow-y-auto">
        <!-- Series Management Header -->
        <div class="p-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-900">Series</h3>
                <div class="flex items-center space-x-2">
                    <button @click="showManualChapterModal = true"
                        :disabled="!currentSeriesId"
                        class="text-xs text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Add chapter manually">
                        + Chapter
                    </button>
                    <button @click="showAddSeriesForm = !showAddSeriesForm"
                        class="text-xs text-blue-600 hover:text-blue-700 transition-colors">
                        {{ showAddSeriesForm ? 'Cancel' : '+ Series' }}
                    </button>
                </div>
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

            <!-- Add Chapter Form -->
            <div v-if="showAddChapterForm" class="space-y-2">
                <input v-model="newChapterTitle" type="text" placeholder="Chapter title"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    @keyup.enter="handleCreateChapter" />
                <div class="flex space-x-2">
                    <button @click="handleCreateChapter" :disabled="!newChapterTitle.trim()"
                        class="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 transition-colors">
                        Save
                    </button>
                    <button @click="cancelAddChapter"
                        class="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors">
                        Cancel
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
                <!-- Show all series when none selected -->
                <div v-if="!currentSeriesId" class="space-y-4">
                    <div v-for="seriesItem in series" :key="seriesItem.id"
                        class="border border-gray-200 rounded-lg overflow-hidden">
                        <!-- Series Header -->
                        <div class="bg-gray-50 p-3 border-b border-gray-200 cursor-pointer" 
                             @click="toggleSeriesSelection(seriesItem.id)">
                            <div class="flex items-center justify-between">
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-sm font-semibold text-gray-900">{{ seriesItem.name }}</h4>
                                    <p v-if="seriesItem.description" class="text-xs text-gray-500 mt-1">{{
                                        seriesItem.description }}</p>
                                    <div class="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                                        <span>{{ seriesItem.chapters.length }} chapters</span>
                                        <span>{{ getSeriesTranslationProgress(seriesItem) }}% translated</span>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-1">
                                    <button @click.stop="editSeries(seriesItem)"
                                        class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Edit series">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
                    </div>
                </div>

                <!-- Show only selected series when one is selected -->
                    v-else-if="currentSeries"
                    :key="currentSeries.id"
                    class="border border-gray-200 rounded-lg overflow-hidden">
                    <!-- Series Header -->
                    <div class="bg-blue-50 p-3 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center space-x-2">
                                    <button @click="deselectSeries"
                                        class="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                        title="Back to all series">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <h4 class="text-sm font-semibold text-gray-900">{{ currentSeries.name }}</h4>
                                </div>
                                <p v-if="currentSeries.description" class="text-xs text-gray-500 mt-1 ml-6">{{
                                    currentSeries.description }}</p>
                                <div class="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                                    <span class="ml-6">{{ currentSeries.chapters.length }} chapters</span>
                                    <span>{{ getSeriesTranslationProgress(currentSeries) }}% translated</span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-1">
                                <button @click="showAddChapterForm = true"
                                    class="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                    title="Add chapter">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                                <button @click.stop="editSeries(currentSeries)"
                                    class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Edit series">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <BulkChapterUpload :seriesId="currentSeries.id" />
                                <button @click.stop="onRemoveSeries(currentSeries.id)"
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
                                    :style="{ width: `${getSeriesTranslationProgress(currentSeries)}%` }" />
                            </div>
                        </div>
                    </div>

                    <!-- Chapters in Series (only show when series is selected) -->
                    <div>
                        <div v-if="currentSeries.chapters.length === 0" class="p-4 text-center">
                            <p class="text-xs text-gray-500">No chapters in this series</p>
                            <p class="text-xs text-gray-400 mt-1">Upload files to add chapters</p>
                        </div>

                        <!-- Virtual scrolling container for large chapter lists -->
                        <div v-else class="max-h-96 overflow-y-auto">
                            <!-- Chapter count indicator for large lists -->
                            <div v-if="currentSeries.chapters.length > 50" class="p-2 bg-yellow-50 border-b border-yellow-200">
                                <p class="text-xs text-yellow-700 text-center">
                                    📚 {{ currentSeries.chapters.length }} chapters in this series
                                </p>
                            </div>
                            
                            <div class="divide-y divide-gray-100">
                                <div v-for="chapter in currentSeries.chapters" :key="chapter.id" 
                                     @click="selectChapter(chapter.id)"
                                     class="group relative p-3 cursor-pointer transition-all hover:bg-blue-50" 
                                     :class="{
                                         'bg-blue-50 border-l-4 border-blue-500': currentChapterId === chapter.id,
                                     }">
                                    <div class="flex items-start justify-between">
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center space-x-2 mb-1">
                                                <span class="text-sm">{{ getFileIcon(chapter.title) }}</span>
                                                <div v-if="!editingChapters.has(chapter.id)" class="flex-1">
                                                    <h5 class="text-sm font-medium text-gray-900 truncate">
                                                        {{ chapter.title }}
                                                    </h5>
                                                </div>
                                                <div v-else class="flex-1">
                                                    <input
                                                        v-model="chapter.title"
                                                        @blur="saveChapterEdit(chapter)"
                                                        @keyup.enter="saveChapterEdit(chapter)"
                                                        @keyup.escape="cancelChapterEdit(chapter)"
                                                        class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        @click.stop
                                                    />
                                                </div>
                                            </div>
                                            <p class="text-xs text-gray-500">
                                                {{ chapter.paragraphs.length }} paragraphs
                                            </p>
                                            <div class="mt-1 flex items-center space-x-3 text-xs text-gray-400">
                                                <span>{{ getTranslationProgress(chapter) }}% translated</span>
                                                <span>{{ formatFileSize(chapter.content.length) }}</span>
                                            </div>
                                        </div>

                                        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button @click.stop="startEditingChapter(chapter)"
                                                v-if="!editingChapters.has(chapter.id)"
                                                class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Edit chapter title">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button @click.stop="onRemoveChapter(chapter.id)"
                                                class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Remove chapter">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
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
</template>

<script setup lang="ts">
import BulkChapterUpload from './BulkChapterUpload.vue';
import SeriesEditModal from './SeriesEditModal.vue';
import ConfirmationModal from './ConfirmationModal.vue';
import { ref } from 'vue';
import { useChapters } from '../composables/useChapters';
import { useDataAPI } from '../composables/useAPI';
import { getFileIcon } from '../utils/fileParser';
import type { Chapter, Series } from '../types';

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

const { updateSeries: updateSeriesAPI, deleteSeries: deleteSeriesAPI, createChapter: createChapterAPI, updateChapter: updateChapterAPI } = useDataAPI();

const showAddSeriesForm = ref(false);
const newSeriesName = ref('');
const newSeriesDescription = ref('');
const showAddChapterForm = ref(false);
const newChapterTitle = ref('');
const showEditModal = ref(false);
const editingSeries = ref<Series | null>(null);
const showDeleteModal = ref(false);
const deletingSeries = ref<Series | null>(null);
const isDeletingSeries = ref(false);
const editingChapters = ref<Set<string>>(new Set());

const handleCreateSeries = () => {
    console.log('handleCreateSeries');
    if (!newSeriesName.value.trim()) return;

    createSeries(newSeriesName.value.trim(), newSeriesDescription.value.trim() || undefined);

    // Reset form
    newSeriesName.value = '';
    newSeriesDescription.value = '';
    showAddSeriesForm.value = false;
};

const handleCreateChapter = async () => {
    console.log('handleCreateChapter');
    if (!newChapterTitle.value.trim() || !currentSeriesId.value) return;

    try {
        // Create empty chapter with just the title
        const emptyContent = `Chapter: ${newChapterTitle.value}\n\n[Add your content here...]`;
        
        // Create via API first
        const response = await createChapterAPI(newChapterTitle.value.trim(), emptyContent, currentSeriesId.value);
        
        if (response.success && response.data) {
            // Add to local state
            await addChapterFromText(emptyContent, newChapterTitle.value.trim(), currentSeriesId.value);
        } else {
            console.error('Failed to create chapter:', response.error);
            // Fallback to local creation
            await addChapterFromText(emptyContent, newChapterTitle.value.trim(), currentSeriesId.value);
        }
        
        // Reset form
        newChapterTitle.value = '';
        showAddChapterForm.value = false;
    } catch (error) {
        console.error('Error creating chapter:', error);
        // Could show error toast here
    }
};

const cancelAddChapter = () => {
    newChapterTitle.value = '';
    showAddChapterForm.value = false;
};

const toggleSeriesSelection = (seriesId: string) => {
    // Always select the series when clicked from the overview
    selectSeriesOnly(seriesId);
};

const deselectSeries = () => {
    selectSeriesOnly('');
};

const startEditingChapter = (chapter: Chapter) => {
    editingChapters.value.add(chapter.id);
};

const saveChapterEdit = async (chapter: Chapter) => {
    if (!chapter.title.trim()) {
        cancelChapterEdit(chapter);
        return;
    }
    
    try {
        // Update via API first
        const response = await updateChapterAPI(chapter.id, { title: chapter.title.trim() });
        
        if (response.success) {
            // Update local state
            await updateChapter(chapter.id, { title: chapter.title.trim() });
        } else {
            console.error('Failed to update chapter:', response.error);
            // Could show error toast here
        }
    } catch (error) {
        console.error('Error updating chapter:', error);
        // Could show error toast here
    }
    
    editingChapters.value.delete(chapter.id);
};

const cancelChapterEdit = (chapter: Chapter) => {
    // Reload chapter data to reset any unsaved changes
    editingChapters.value.delete(chapter.id);
    // In a real app, you might want to reload the chapter from API
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
        // Update via API first
        const response = await updateSeriesAPI(editingSeries.value.id, { name, description });
        
        if (response.success) {
            // Update local state
            await updateSeries(editingSeries.value.id, { name, description });
            closeEditModal();
        } else {
            console.error('Failed to update series:', response.error);
            // Could show error toast here
        }
    } catch (error) {
        console.error('Error updating series:', error);
        // Could show error toast here
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
        // Delete via API first
        const response = await deleteSeriesAPI(deletingSeries.value.id);
        
        if (response.success) {
            // Update local state
            await deleteSeries(deletingSeries.value.id);
            closeDeleteModal();
        } else {
            console.error('Failed to delete series:', response.error);
            // Could show error toast here
        }
    } catch (error) {
        console.error('Error deleting series:', error);
        // Could show error toast here
    } finally {
        isDeletingSeries.value = false;
    }
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