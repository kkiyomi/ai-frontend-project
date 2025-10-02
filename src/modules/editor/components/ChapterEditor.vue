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
  <div class="flex-1 flex flex-col h-full bg-white">
    <TranslationHeader
      :currentChapter="currentChapter"
      :isEditingOriginal="isEditingOriginal"
      :layoutMode="layoutMode"
      :contentMode="contentMode"
      :isTranslating="isTranslating"
      :translationProgress="translationProgress"
      @toggleEditMode="editor.toggleEditingOriginal()"
      @toggleLayoutMode="editor.toggleLayoutMode()"
      @toggleContentMode="editor.toggleContentMode()"
      @translateAll="$emit('translateAll')"
    />

    <div v-if="!currentChapter" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">📖</div>
        <h3 class="text-xl font-medium text-secondary-900 mb-2">Ready to Edit</h3>
        <p class="text-secondary-500">Select a chapter from the sidebar to get started</p>
      </div>
    </div>

    <div v-else class="flex-1 overflow-hidden">
      <div v-if="layoutMode === 'split'" class="h-full flex">
        <TextColumn
          v-if="contentMode === 'all'"
          title="Original Text"
          :paragraphs="currentChapter.originalParagraphs"
          mode="paragraph"
          type="original"
          :editingParagraphs="editingOriginalParagraphs"
          :showBorder="true"
          :showEditButton="!isEditingOriginal"
          placeholder="Enter original text..."
          :highlightTermsInText="highlightFn"
          :isHighlightEnabled="isHighlightEnabled"
          @toggleEdit="editor.toggleEditingOriginal()"
          @toggleParagraphEditing="handleToggleParagraphEditing($event, 'original')"
          @saveParagraph="(index: number, content: string) => handleSaveParagraph(index, content, 'original')"
          @cancelParagraphEdit="handleCancelParagraphEdit($event, 'original')"
        />

        <TextColumn
          title="Translation"
          :paragraphs="currentChapter.translatedParagraphs"
          mode="paragraph"
          type="translated"
          :editingParagraphs="editingTranslatedParagraphs"
          emptyMessage="No translation yet"
          placeholder="Enter translation..."
          :highlightTermsInText="highlightFn"
          :isHighlightEnabled="isHighlightEnabled"
          @toggleParagraphEditing="handleToggleParagraphEditing($event, 'translated')"
          @saveParagraph="(index: number, content: string) => handleSaveParagraph(index, content, 'translated')"
          @cancelParagraphEdit="(index: number) => handleCancelParagraphEdit(index, 'translated')"
        />
      </div>

      <div v-else class="h-full flex">
        <TextColumn
          v-if="contentMode === 'all'"
          title="Original Text"
          :fullText="getFullOriginalText()"
          :paragraphs="currentChapter.originalParagraphs"
          mode="full"
          type="original"
          :editingParagraphs="editingOriginalParagraphs"
          :isEditingMode="isEditingOriginal"
          :showBorder="true"
          :showEditButton="!isEditingOriginal"
          placeholder="Enter original text..."
          :highlightTermsInText="highlightFn"
          :isHighlightEnabled="isHighlightEnabled"
          @toggleEdit="editor.toggleEditingOriginal()"
          @saveFullText="editor.saveFullOriginalText($event)"
        />

        <TextColumn
          title="Translation"
          :fullText="getFullTranslatedText()"
          :paragraphs="currentChapter.translatedParagraphs"
          :mode="layoutMode === 'full' ? 'full' : 'paragraph'"
          type="translated"
          :editingParagraphs="editingTranslatedParagraphs"
          emptyMessage="No translations yet"
          placeholder="Enter translation..."
          :highlightTermsInText="highlightFn"
          :isHighlightEnabled="isHighlightEnabled"
          @toggleParagraphEditing="handleToggleParagraphEditing($event, 'translated')"
          @saveParagraph="(index: number, content: string) => handleSaveParagraph(index, content, 'translated')"
          @cancelParagraphEdit="(index: number) => handleCancelParagraphEdit(index, 'translated')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useEditorStore } from '../store';
import TranslationHeader from './TranslationHeader.vue';
import TextColumn from './TextColumn.vue';

interface Props {
  chapterId?: string | null;
  highlightTermsInText?: (text: string) => string;
  isHighlightEnabled?: boolean;
  isTranslating?: boolean;
  translationProgress?: number;
}

const props = withDefaults(defineProps<Props>(), {
  chapterId: null,
  isHighlightEnabled: false,
  isTranslating: false,
  translationProgress: 0,
});

const emit = defineEmits<{
  translateAll: [];
  chapterUpdated: [chapterId: string];
}>();

const editor = useEditorStore();

const currentChapter = computed(() => editor.currentChapter);
const isEditingOriginal = computed(() => editor.isEditingOriginal);
const editingOriginalParagraphs = computed(() => editor.editingOriginalParagraphs);
const editingTranslatedParagraphs = computed(() => editor.editingTranslatedParagraphs);
const layoutMode = computed(() => editor.layoutMode);
const contentMode = computed(() => editor.contentMode);

const highlightFn = computed(() => props.highlightTermsInText);

watch(() => props.chapterId, (newChapterId) => {
  if (newChapterId) {
    editor.loadChapter(newChapterId);
  }
}, { immediate: true });

function handleToggleParagraphEditing(index: number, type: 'original' | 'translated') {
  const editingSet = type === 'original'
    ? editor.editingOriginalParagraphs
    : editor.editingTranslatedParagraphs;

  if (editingSet.has(index)) {
    editor.stopEditingParagraph(index, type);
  } else {
    editor.startEditingParagraph(index, type);
  }
}

function handleSaveParagraph(index: number, content: string, type: 'original' | 'translated') {
  editor.saveParagraph(index, content, type);
  emit('chapterUpdated', editor.currentChapterId!);
}

function handleCancelParagraphEdit(index: number, type: 'original' | 'translated') {
  editor.cancelParagraphEdit(index, type);
}

function getFullOriginalText(): string {
  if (!currentChapter.value) return '';
  return currentChapter.value.originalParagraphs.join('<br>');
}

function getFullTranslatedText(): string {
  if (!currentChapter.value) return '';
  const translations = currentChapter.value.translatedParagraphs.filter(text => text.trim());

  if (translations.length === 0) return '';

  return currentChapter.value.translatedParagraphs.join('<br>');
}
</script>
