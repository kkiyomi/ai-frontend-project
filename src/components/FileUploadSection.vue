<template>
    <div class="p-4 flex-shrink-0">
        <!-- Series Selection for Upload -->
        <div v-if="series.length > 0" class="mb-4">
            <label class="block text-xs font-medium text-gray-700 mb-2">Upload to Series:</label>
            <select v-model="selectedSeriesForUpload"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                <option v-for="seriesItem in series" :key="seriesItem.id" :value="seriesItem.id">
                    {{ seriesItem.name }} ({{ seriesItem.chapters.length }} chapters)
                </option>
            </select>
        </div>

        <div class="relative">
            <input ref="fileInput" type="file" accept=".txt,.pdf,.docx,.doc" multiple @change="handleFileUpload"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <div class="text-3xl mb-2">📚</div>
                <p class="text-sm font-medium text-gray-900 mb-1">Upload Chapters</p>
                <p class="text-xs text-gray-500">
                    PDF, DOCX, or TXT files
                    <span v-if="selectedSeriesForUpload && series.length > 0" class="block mt-1 text-blue-600">
                        → {{ getSelectedSeriesName() }}
                    </span>
                </p>
            </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="mt-3">
            <div class="bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300 w-1/2"></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Processing files...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChapters } from '../composables/useChapters';
import { useChaptersStore } from '@/modules/chapters';

const { series, currentSeriesId } = useChapters();
const chaptersStore = useChaptersStore();

const fileInput = ref<HTMLInputElement>();
const isUploading = ref(false);
const selectedSeriesForUpload = ref<string | null>(null);

// Auto-select current series for upload
if (currentSeriesId.value) {
    selectedSeriesForUpload.value = currentSeriesId.value;
}

const getSelectedSeriesName = (): string => {
    const selectedSeries = series.value.find(s => s.id === selectedSeriesForUpload.value);
    return selectedSeries?.name || '';
};

const handleFileUpload = async (event: Event) => {
    console.log('handleFileUpload');
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    isUploading.value = true;

    try {
        for (const file of Array.from(files)) {
            console.log('addChapter');
            if (selectedSeriesForUpload.value) {
                await chaptersStore.addChapter(file, selectedSeriesForUpload.value);
            }
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        // In a real app, you'd show a toast notification here
    } finally {
        isUploading.value = false;
        // Clear the input so the same file can be uploaded again
        if (target) target.value = '';
    }
};
</script>