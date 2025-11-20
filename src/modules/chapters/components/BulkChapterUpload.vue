<template>
    <div class="relative inline-block">
        <!-- Upload Button -->
        <button @click="triggerFileInput" class="p-1 text-gray-400 hover:text-green-500 transition-colors"
            title="Upload multiple chapters" :disabled="isUploading">
            <svg v-if="!isUploading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </button>

        <!-- Hidden File Input -->
        <input ref="fileInput" type="file" multiple accept=".txt,.md,.docx,.pdf" class="hidden"
            @change="handleFileUpload" />

        <!-- Progress Modal -->
        <div v-if="isUploading || showResults"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="closeModal">
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">
                        {{ isUploading ? 'Uploading Chapters' : 'Upload Results' }}
                    </h3>
                    <button v-if="!isUploading" @click="closeModal"
                        class="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Upload Progress -->
                <div v-if="isUploading" class="space-y-4">
                    <div class="bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            :style="{ width: `${uploadProgress}%` }" />
                    </div>
                    <p class="text-sm text-gray-600 text-center">
                        Uploading {{ currentFileIndex }} of {{ totalFiles }} files...
                    </p>
                    <p v-if="currentFileName" class="text-xs text-gray-500 text-center truncate">
                        {{ currentFileName }}
                    </p>
                </div>

                <!-- Upload Results -->
                <div v-else-if="showResults" class="space-y-4">
                    <div class="text-center">
                        <div class="text-4xl mb-2">
                            {{ uploadResults.success.length > 0 ? '✅' : '❌' }}
                        </div>
                        <p class="text-sm text-gray-600">
                            {{ uploadResults.success.length }} of {{ uploadResults.total }} files uploaded successfully
                        </p>
                    </div>

                    <!-- Success List -->
                    <div v-if="uploadResults.success.length > 0" class="space-y-2">
                        <h4 class="text-sm font-medium text-green-600">Successfully uploaded:</h4>
                        <div class="max-h-32 overflow-y-auto space-y-1">
                            <div v-for="file in uploadResults.success" :key="file"
                                class="text-xs text-gray-600 bg-green-50 px-2 py-1 rounded">
                                {{ file }}
                            </div>
                        </div>
                    </div>

                    <!-- Error List -->
                    <div v-if="uploadResults.errors.length > 0" class="space-y-2">
                        <h4 class="text-sm font-medium text-red-600">Failed to upload:</h4>
                        <div class="max-h-32 overflow-y-auto space-y-1">
                            <div v-for="error in uploadResults.errors" :key="error.file"
                                class="text-xs text-gray-600 bg-red-50 px-2 py-1 rounded">
                                <div class="font-medium">{{ error.file }}</div>
                                <div class="text-red-500">{{ error.error }}</div>
                            </div>
                        </div>
                    </div>

                    <button @click="closeModal"
                        class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useChaptersStore } from '../store';

interface Props {
    seriesId: string;
}

const props = defineProps<Props>();

const chaptersStore = useChaptersStore();

const fileInput = ref<HTMLInputElement>();
const isUploading = ref(false);
const showResults = ref(false);
const currentFileIndex = ref(0);
const totalFiles = ref(0);
const currentFileName = ref('');

const uploadResults = ref<{
    success: string[];
    errors: Array<{ file: string; error: string }>;
    total: number;
}>({
    success: [],
    errors: [],
    total: 0
});

const uploadProgress = computed(() => {
    if (totalFiles.value === 0) return 0;
    return Math.round((currentFileIndex.value / totalFiles.value) * 100);
});

const triggerFileInput = () => {
    if (isUploading.value) return;
    fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
    console.log('handleFileUpload');
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    // Reset state
    isUploading.value = true;
    showResults.value = false;
    currentFileIndex.value = 0;
    totalFiles.value = files.length;
    uploadResults.value = {
        success: [],
        errors: [],
        total: files.length
    };

    // Process files one by one
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        currentFileIndex.value = i + 1;
        currentFileName.value = file.name;

        try {
            console.log('addChapter');
            await chaptersStore.addChapter(file, props.seriesId);
            uploadResults.value.success.push(file.name);
        } catch (error) {
            uploadResults.value.errors.push({
                file: file.name,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Show results
    isUploading.value = false;
    showResults.value = true;
    currentFileName.value = '';

    // Reset file input
    if (target) {
        target.value = '';
    }
};

const closeModal = () => {
    if (isUploading.value) return; // Don't allow closing during upload
    showResults.value = false;
    uploadResults.value = {
        success: [],
        errors: [],
        total: 0
    };
};
</script>