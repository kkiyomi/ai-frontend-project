<template>
  <div class="w-80 bg-white border-r border-secondary-200 flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-secondary-200">
      <h1 class="text-xl font-bold text-secondary-900 mb-2">Translation Tool</h1>
      <p class="text-sm text-secondary-600">Upload and manage your novel chapters</p>
    </div>

    <!-- Upload Section -->
    <div class="p-4 border-b border-secondary-200">
      <div class="relative">
        <input
          ref="fileInput"
          type="file"
          accept=".txt,.pdf,.docx,.doc"
          multiple
          @change="handleFileUpload"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div class="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors">
          <div class="text-3xl mb-2">📚</div>
          <p class="text-sm font-medium text-secondary-900 mb-1">Upload Chapters</p>
          <p class="text-xs text-secondary-500">PDF, DOCX, or TXT files</p>
        </div>
      </div>
      
      <!-- Upload Progress -->
      <div v-if="isUploading" class="mt-3">
        <div class="bg-secondary-200 rounded-full h-2">
          <div class="bg-primary-600 h-2 rounded-full transition-all duration-300 w-1/2"></div>
        </div>
        <p class="text-xs text-secondary-500 mt-1">Processing files...</p>
      </div>
    </div>

    <!-- Chapters List -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-secondary-900">Chapters</h3>
          <span class="text-xs text-secondary-500">{{ chapters.length }}</span>
        </div>
        
        <div v-if="chapters.length === 0" class="text-center py-8">
          <div class="text-4xl mb-3">📖</div>
          <p class="text-sm text-secondary-500">No chapters uploaded yet</p>
        </div>
        
        <div v-else class="space-y-2">
          <div
            v-for="chapter in chapters"
            :key="chapter.id"
            @click="selectChapter(chapter.id)"
            class="group relative p-3 rounded-lg border border-secondary-200 cursor-pointer transition-all hover:border-primary-300 hover:bg-primary-50"
            :class="{
              'border-primary-500 bg-primary-50': currentChapterId === chapter.id,
              'hover:shadow-sm': currentChapterId !== chapter.id
            }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-lg">{{ getFileIcon(chapter.title) }}</span>
                  <h4 class="text-sm font-medium text-secondary-900 truncate">
                    {{ chapter.title }}
                  </h4>
                </div>
                <p class="text-xs text-secondary-500">
                  {{ chapter.paragraphs.length }} paragraphs
                </p>
                <div class="mt-2 flex items-center space-x-4 text-xs text-secondary-400">
                  <span>{{ getTranslationProgress(chapter) }}% translated</span>
                  <span>{{ formatFileSize(chapter.content.length) }}</span>
                </div>
              </div>
              
              <button
                @click.stop="removeChapter(chapter.id)"
                class="opacity-0 group-hover:opacity-100 p-1 text-secondary-400 hover:text-red-500 transition-all"
                title="Remove chapter"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <!-- Progress Bar -->
            <div class="mt-2">
              <div class="bg-secondary-200 rounded-full h-1">
                <div 
                  class="bg-primary-500 h-1 rounded-full transition-all duration-300"
                  :style="{ width: `${getTranslationProgress(chapter)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="p-4 border-t border-secondary-200">
      <button
        @click="toggleGlossaryVisibility"
        class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
        <span>{{ isGlossaryVisible ? 'Hide' : 'Show' }} Glossary</span>
      </button>
      
      <div class="mt-3 text-center">
        <p class="text-xs text-secondary-500">
          {{ getTotalStats() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useChapters } from '../composables/useChapters';
import { useGlossary } from '../composables/useGlossary';
import { getFileIcon } from '../utils/fileParser';
import type { Chapter } from '../types';

const { 
  chapters, 
  currentChapterId, 
  addChapter, 
  selectChapter, 
  removeChapter 
} = useChapters();

const { isGlossaryVisible, toggleGlossaryVisibility } = useGlossary();

const fileInput = ref<HTMLInputElement>();
const isUploading = ref(false);

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files || files.length === 0) return;
  
  isUploading.value = true;
  
  try {
    for (const file of Array.from(files)) {
      await addChapter(file);
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

const getTranslationProgress = (chapter: Chapter): number => {
  if (chapter.paragraphs.length === 0) return 0;
  const translatedCount = chapter.paragraphs.filter(p => p.translatedText.trim()).length;
  return Math.round((translatedCount / chapter.paragraphs.length) * 100);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getTotalStats = (): string => {
  const totalParagraphs = chapters.value.reduce((sum, chapter) => sum + chapter.paragraphs.length, 0);
  const translatedParagraphs = chapters.value.reduce((sum, chapter) => 
    sum + chapter.paragraphs.filter(p => p.translatedText.trim()).length, 0
  );
  
  if (totalParagraphs === 0) return 'No content yet';
  
  return `${translatedParagraphs}/${totalParagraphs} paragraphs translated`;
};
</script>