<!--
  Editor Module - Main Chapter Editor Component

  Full-featured chapter editing interface with:
  - Split and full-text viewing modes
  - Paragraph-by-paragraph editing
  - Glossary term highlighting
  - Auto-save functionality

  Usage:
  ```vue
  <ChapterEditor
    :chapter="currentChapter"
    :chapterId="currentChapterId"
    @chapter-updated="handleChapterUpdate"
  />
  ```

  This component integrates with:
  - Editor store for state management
  - Glossary module for term highlighting (decoupled)
  - Core API for data persistence
-->
<template>
  <div class="flex-1 flex flex-col bg-white overflow-hidden">

    <div v-if="!currentChapter" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">📖</div>
        <h3 class="text-xl font-medium text-secondary-900 mb-2">Ready to Edit</h3>
        <p class="text-secondary-500">Select a chapter from the sidebar to get started</p>
      </div>
    </div>

    <div v-else class="flex-1 overflow-hidden">
      <div class="h-full flex">
        <!-- Original Text Column -->
        <TextColumn
          v-if="contentMode === 'all'"
          title="Original Text"
          :paragraphs="currentChapter.originalParagraphs"
          :fullText="layoutMode === 'full' ? getFullOriginalText() : undefined"
          :mode="layoutMode === 'split' ? 'paragraph' : 'full'"
          type="original"
          :editingParagraphs="editingOriginalParagraphs"
          :showBorder="true"
          :showEditButton="layoutMode === 'split' && !isEditingOriginal"
          emptyMessage="No original text yet"
          placeholder="Enter original text..."
          :highlightTermsInText="highlightFn"
          :isHighlightEnabled="isHighlightEnabled"
        />

        <!-- Translation Column -->
        <TextColumn
          title="Translation"
          :paragraphs="currentChapter.translatedParagraphs"
          :fullText="layoutMode === 'full' ? getFullTranslatedText() : undefined"
          :mode="layoutMode === 'split' ? 'paragraph' : 'full'"
          type="translated"
          :editingParagraphs="editingTranslatedParagraphs"
          :showEditButton="layoutMode === 'split'"
          emptyMessage="No translation yet"
          placeholder="Enter translation..."
          :highlightTermsInText="highlightFn"
          :isHighlightEnabled="isHighlightEnabled"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useEditorStore } from '../store';
import { type Chapter } from '../types';
import TextColumn from './TextColumn.vue';

interface Props {
  chapter: Chapter | null;
  chapterId?: string | null;
  highlightTermsInText?: (text: string) => string;
  isHighlightEnabled?: boolean;
  isTranslating?: boolean;
  translationProgress?: number;
}

const props = withDefaults(defineProps<Props>(), {
  chapter: null,
  chapterId: null,
  isHighlightEnabled: false,
  isTranslating: false,
  translationProgress: 0,
});

const emit = defineEmits<{
  chapterUpdated: [chapterId: string | null, updatedChapter: Chapter | null];
}>();

const editor = useEditorStore();

const currentChapter = computed(() => editor.currentChapter);
const currentChapterId = computed(() => editor.currentChapterId);
const isEditingOriginal = computed(() => editor.isEditingOriginal);
const isEditingTranslated = computed(() => editor.isEditingTranslated);
const editingOriginalParagraphs = computed(() => editor.editingOriginalParagraphs);
const editingTranslatedParagraphs = computed(() => editor.editingTranslatedParagraphs);
const layoutMode = computed(() => editor.layoutMode);
const contentMode = computed(() => editor.contentMode);

const highlightFn = computed(() => props.highlightTermsInText);

watch(() => props.chapterId, (newChapterId: string | null) => {
  if (props.chapter) {
    editor.loadChapter(props.chapter);
  } else {
    editor.clearChapter()
  }
}, { immediate: true });

function getFullOriginalText(): string {
  if (!currentChapter.value) return '';
  return currentChapter.value.originalParagraphs.join('<br>');
}

function getFullTranslatedText(): string {
  if (!currentChapter.value) return '';
  return currentChapter.value.translatedParagraphs.join('<br>');
}

</script>
