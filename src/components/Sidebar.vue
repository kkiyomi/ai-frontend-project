<template>
  <div  
    class="group relative bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out z-20 overflow-hidden"
    :class="isExpanded ? 'w-80' : 'w-12'"
    @mouseenter="isExpanded = true"
  >
    <!-- Minimized State Icons -->
    <div v-if="!isExpanded" class="flex flex-col items-center py-4 space-y-4 flex-shrink-0">
      <!-- Main Icon -->
      <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      </div>
      
      <!-- Web Scraper Icon -->
      <button 
        class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center hover:bg-purple-200 transition-colors"
        title="Web scraper"
      >
        <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
      </button>
      
      <!-- Upload Icon -->
      <button 
        class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
        title="Upload files"
      >
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
      </button>
      
      <!-- Chapter Count Badge -->
      <div v-if="chapters.length > 0" class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
        {{ chapters.length }}
      </div>
      
      <!-- Glossary Toggle Icon -->
      <button 
        @click="toggleGlossaryVisibility"
        class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition-colors"
        :class="{ 'bg-green-200': isGlossaryVisible }"
        title="Toggle glossary"
      >
        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      </button>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="flex flex-col h-full">
      <!-- Header --> 
      <div class="p-4 border-b border-gray-200 flex-shrink-0">
        <h1 class="text-xl font-bold text-gray-900 mb-2">Translation Tool</h1>
        <p class="text-sm text-gray-600">Upload and manage your novel chapters</p>
      </div>

      <!-- Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto min-h-0 pb-4">
        <!-- URL Scraper Component -->
        <UrlScraper />

        <!-- File Upload Area -->
        <div class="p-4 flex-shrink-0">
          <div class="relative">
            <input
              ref="fileInput"
              type="file"
              accept=".txt,.pdf,.docx,.doc"
              multiple
              @change="handleFileUpload"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <div class="text-3xl mb-2">📚</div>
              <p class="text-sm font-medium text-gray-900 mb-1">Upload Chapters</p>
              <p class="text-xs text-gray-500">PDF, DOCX, or TXT files</p>
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

        <!-- Chapters List -->
        <div class="p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900">Chapters</h3>
            <span class="text-xs text-gray-500">{{ chapters.length }}</span>
          </div>
          
          <div v-if="chapters.length === 0" class="text-center py-8">
            <div class="text-4xl mb-3">📖</div>
            <p class="text-sm text-gray-500">No chapters uploaded yet</p>
          </div>
          
          <div v-else class="space-y-2">
            <div
              v-for="chapter in chapters"
              :key="chapter.id"
              @click="selectChapter(chapter.id)"
              class="group relative p-3 rounded-lg border border-gray-200 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50"
              :class="{
                'border-blue-500 bg-blue-50': currentChapterId === chapter.id,
                'hover:shadow-sm': currentChapterId !== chapter.id
              }"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="text-lg">{{ getFileIcon(chapter.title) }}</span>
                    <h4 class="text-sm font-medium text-gray-900 truncate">
                      {{ chapter.title }}
                    </h4>
                  </div>
                  <p class="text-xs text-gray-500">
                    {{ chapter.paragraphs.length }} paragraphs
                  </p>
                  <div class="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                    <span>{{ getTranslationProgress(chapter) }}% translated</span>
                    <span>{{ formatFileSize(chapter.content.length) }}</span>
                  </div>
                </div>
                
                <button
                  @click.stop="removeChapter(chapter.id)"
                  class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                  title="Remove chapter"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <!-- Progress Bar -->
              <div class="mt-2">
                <div class="bg-gray-200 rounded-full h-1">
                  <div 
                    class="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    :style="{ width: `${getTranslationProgress(chapter)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Footer Actions (always visible when expanded) -->
      <div class="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <button
          @click="toggleGlossaryVisibility"
          class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          <span>{{ isGlossaryVisible ? 'Hide' : 'Show' }} Glossary</span>
        </button>
        
        <div class="mt-3 text-center">
          <p class="text-xs text-gray-500">
            {{ getTotalStats() }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import UrlScraper from './UrlScraper.vue';
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
const isExpanded = ref(false);

const closeTranslationViewIfClickedOutside = (event: Event) => {
  if (event.target !== event.currentTarget) {
    isExpanded.value = false;
  }
};

function handleClickOutside(event) {
  if (sidebar.value && !sidebar.value.contains(event.target)) {
    isExpanded.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
  
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