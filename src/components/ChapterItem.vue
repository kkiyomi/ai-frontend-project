<template>
  <div 
    @click="$emit('select')"
    class="group relative p-3 cursor-pointer transition-all hover:bg-blue-50" 
    :class="{
      'bg-blue-50 border-l-4 border-blue-500': isSelected,
    }"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2 mb-1">
          <span class="text-sm">{{ fileIcon }}</span>
          <div v-if="!isEditing" class="flex-1">
            <h5 class="text-sm font-medium text-gray-900 truncate">
              {{ chapter.title }}
            </h5>
          </div>
          <div v-else class="flex-1">
            <input
              v-model="editableTitle"
              @blur="$emit('saveEdit', { ...chapter, title: editableTitle })"
              @keyup.enter="$emit('saveEdit', { ...chapter, title: editableTitle })"
              @keyup.escape="$emit('cancelEdit', chapter)"
              class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              @click.stop
            />
          </div>
        </div>
        <p class="text-xs text-gray-500">
          {{ chapter.originalParagraphs.length }} paragraphs
        </p>
        <div class="mt-1 flex items-center space-x-3 text-xs text-gray-400">
          <span>{{ translationProgress }}% translated</span>
          <span>{{ fileSize }}</span>
        </div>
      </div>

      <div 
        v-if="!isEditing"
        class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button 
          @click.stop="$emit('startEdit', chapter)"
          class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="Edit chapter title"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          @click.stop="$emit('delete')"
          class="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove chapter"
        >
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
        <div 
          class="bg-green-500 h-1 rounded-full transition-all duration-300"
          :style="{ width: `${translationProgress}%` }" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { getChapterTranslationProgress, formatFileSize, getFileIcon } from '../utils/chapterUtils';
import type { Chapter } from '../types';

interface Props {
  chapter: Chapter;
  isSelected: boolean;
  isEditing: boolean;
}

const props = defineProps<Props>();

defineEmits<{
  select: [];
  startEdit: [chapter: Chapter];
  saveEdit: [chapter: Chapter];
  cancelEdit: [chapter: Chapter];
  delete: [];
}>();

const editableTitle = ref(props.chapter.title);

// Reset editable title when editing starts
watch(() => props.isEditing, (isEditing) => {
  if (isEditing) {
    editableTitle.value = props.chapter.title;
  }
});

const translationProgress = computed(() => getChapterTranslationProgress(props.chapter));
const fileSize = computed(() => formatFileSize(props.chapter.content.length));
const fileIcon = computed(() => getFileIcon(props.chapter.title));
</script>