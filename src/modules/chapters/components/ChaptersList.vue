<template>
  <div>
    <div v-if="chapters.length === 0" class="p-4 text-center">
      <p class="text-xs text-gray-500">No chapters in this series</p>
      <p class="text-xs text-gray-400 mt-1">Upload files to add chapters</p>
    </div>

    <!-- Virtual scrolling container for large chapter lists -->
    <div v-else class="overflow-y-auto">
      <!-- Chapter count indicator for large lists -->
      <div v-if="chapters.length > 50" class="p-2 bg-yellow-50 border-b border-yellow-200">
        <p class="text-xs text-yellow-700 text-center">
          📚 {{ chapters.length }} chapters in this series
        </p>
      </div>
      
      <div class="divide-y divide-gray-100">
        <ChapterItem
          v-for="chapter in chapters"
          :key="chapter.id"
          :chapter="chapter"
          :isSelected="currentChapterId === chapter.id"
          :isEditing="editingChapters.has(chapter.id)"
          @select="selectChapter(chapter.id)"
          @startEdit="startEditingChapter"
          @saveEdit="saveChapterEdit"
          @cancelEdit="cancelChapterEdit"
          @delete="$emit('delete', chapter.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChaptersStore } from '../store';
import ChapterItem from './ChapterItem.vue';
import type { Chapter } from '../types';

interface Props {
  chapters: Chapter[];
  currentChapterId: string | null;
}

defineProps<Props>();

const emit = defineEmits<{
  delete: [chapterId: string];
}>();

const {
  selectChapter,
  updateChapter,
} = useChaptersStore();

const editingChapters = ref<Set<string>>(new Set());

const handleChapterEdit = async (chapter: Chapter) => {
  await updateChapter(chapter.id, { title: chapter.title.trim() });
};

const startEditingChapter = (chapter: Chapter) => {
  editingChapters.value.add(chapter.id);
};

const saveChapterEdit = (chapter: Chapter) => {
  if (!chapter.title.trim()) {
    cancelChapterEdit(chapter);
    return;
  }
  
  handleChapterEdit(chapter);
  editingChapters.value.delete(chapter.id);
};

const cancelChapterEdit = (chapter: Chapter) => {
  editingChapters.value.delete(chapter.id);
};
</script>