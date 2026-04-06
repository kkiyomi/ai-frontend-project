<template>
  <div 
    @click="selectChapter(chapter)"
    class="group relative p-3 cursor-pointer transition-all hover:bg-primary/5"
    :class="{
      'bg-primary/10 border-l-4 border-primary/50': currentChapterId === chapter.id,
    }"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2 mb-1">
          <span class="text-sm">{{ fileIcon }}</span>
          <div v-if="!isEditing" class="flex-1">
            <h5 class="text-sm font-medium text-base-content truncate">
              {{ chapter.title }}
            </h5>
          </div>
          <div v-else class="flex-1">
            <input
              v-model="editableTitle"
              @blur="saveChapterEdit({ ...chapter, title: editableTitle })"
              @keyup.enter="saveChapterEdit({ ...chapter, title: editableTitle })"
              @keyup.escape="cancelChapterEdit"
              class="input input-bordered input-sm w-full"
              @click.stop
            />
          </div>
        </div>
        <p class="text-xs text-base-content/60">
          {{ chapter.originalParagraphs.length }} paragraphs
        </p>
        <div class="mt-1 flex items-center space-x-3 text-xs text-base-content/40">
          <span>{{ translationProgress }}% translated</span>
          <span>{{ fileSize }}</span>
        </div>
      </div>

      <div 
        v-if="!isEditing"
        class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
          <button 
            @click.stop="startEditingChapter"
            class="btn btn-ghost btn-xs btn-circle p-1 text-base-content/40 hover:text-primary/70 transition-colors"
            title="Edit chapter title"
          >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
         <button 
            @click.stop="$emit('delete')"
            class="btn btn-ghost btn-xs btn-circle p-1 text-base-content/40 hover:text-red-500 transition-colors"
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
      <progress 
        class="progress progress-primary h-1 rounded-full" 
        :value="translationProgress" 
        max="100"
      ></progress>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getChapterTranslationProgress, formatFileSize, getFileIcon } from '@/utils/chapterUtils';
import { useChaptersStore } from '../store';
import type { Chapter } from '../types';

interface Props {
  chapter: Chapter;
}

const props = defineProps<Props>();

defineEmits<{
  delete: [];
}>();

const router = useRouter();
const chaptersStore = useChaptersStore();

const currentChapterId = computed(() => chaptersStore.currentChapterId);

const isEditing = ref(false);
const editableTitle = ref(props.chapter.title);

const selectChapter = (chapter: Chapter) => {
  router.push(`/series/${chapter.seriesId}/chapters/${chapter.id}`);
};

const startEditingChapter = () => {
  isEditing.value = true;
};

const saveChapterEdit =  async (chapter: Chapter) => {
  if (!chapter.title.trim()) {
    cancelChapterEdit();
    return;
  }

  await chaptersStore.updateChapter(chapter.id, { title: chapter.title.trim() });
  cancelChapterEdit();
};

const cancelChapterEdit = () => {
  isEditing.value = false;
  editableTitle.value = props.chapter.title;
};

// Reset editable title when editing starts
watch(() => isEditing, (isEditing) => {
  if (isEditing) {
    editableTitle.value = props.chapter.title;
  }
});

const translationProgress = computed(() => getChapterTranslationProgress(props.chapter));
const fileSize = computed(() => formatFileSize(props.chapter.content.length));
const fileIcon = computed(() => getFileIcon(props.chapter.title));
</script>