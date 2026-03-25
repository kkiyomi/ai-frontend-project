<!--
  TranslationView - Integration Component

  This component integrates the Editor module with the Glossary module
  at the application level. It demonstrates proper module decoupling:
  - Editor module handles chapter editing state and operations
  - Glossary module provides term highlighting functionality
  - This component connects them via props (no direct module dependencies)
  - Auto-save functionality triggered by editor store state changes
-->
<template>
  <div class="flex-1 flex flex-col bg-white overflow-hidden">
    <TranslationHeader />

    <ChapterEditor
      :chapter="currentChapter"
      :chapterId="currentChapterId"
      :highlightTermsInText="glossary.highlightTermsInText"
      :isHighlightEnabled="glossary.isHighlightEnabled"
      :isTranslating="translation.isTranslating"
      :translationProgress="translation.translationProgress"
    />
  </div>

  <GlossaryTermPopup
    v-if="showGlossaryPopup && hoveredTerm"
    :term="hoveredTerm"
    :position="popupPosition"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { debounce } from 'perfect-debounce';
import { ChapterEditor, useEditorStore } from '@/modules/editor';
import {
  useGlossaryStore, useGlossaryPopup,
  GlossaryTermPopup, type GlossaryTerm
} from '@/modules/glossary';
import { useTranslationStore } from '@/modules/translation';
import { useChaptersStore, type Chapter, type ChapterUpdateInput } from '@/modules/chapters';
import TranslationHeader from './TranslationHeader.vue';

const chaptersStore = useChaptersStore();
const currentChapter = computed(() => chaptersStore.currentChapter);
const currentChapterId = computed(() => chaptersStore.currentChapterId);

const editor = useEditorStore();
const translation = useTranslationStore();
const glossary = useGlossaryStore();

const {
  showPopup: showGlossaryPopup,
  hoveredTerm,
  popupPosition,
} = useGlossaryPopup();

const saveChapter = debounce(async () => {
  if (!editor.currentChapter || editor.dirtyFields.length === 0 || editor.isSaving) {
    return;
  }

  // Cancel any pending save
  editor.cancelPendingSave();
  editor.setSaving(true);
  
  const fieldsToSave = [...editor.dirtyFields];
  
  try {
    const updateData: ChapterUpdateInput = {};
    if (fieldsToSave.includes('content')) {
      updateData.content = editor.currentChapter.content;
    }
    if (fieldsToSave.includes('translatedContent')) {
      updateData.translatedContent = editor.currentChapter.translatedContent;
    }
    
    await chaptersStore.updateChapter(editor.currentChapter.id, updateData);
    editor.markFieldsSaved(fieldsToSave);
  } catch (error) {
    console.error('Failed to save chapter:', error);
    editor.markSaveFailed();
  } finally {
    editor.setSaving(false);
  }
}, 500);

watch(
  () => editor.dirtyFields.length,
  () => {
    if (editor.dirtyFields.length > 0) {
      saveChapter();
    }
  }
);

// Watch for translation completion and refresh chapter
watch(
  () => translation.currentJobData?.status,
  async (status, previousStatus) => {
    // When translation completes successfully
    if (previousStatus === 'processing' && status === 'completed') {
      const chapterId = translation.currentChapterId;
      if (chapterId) {
        // Refetch updated chapter from backend
        await chaptersStore.refresh(undefined, [chapterId]);

        // Update editor store if same chapter is loaded
        if (editor.currentChapterId === chapterId) {
          const updatedChapter = chaptersStore.chapters.find(ch => ch.id === chapterId);
          if (updatedChapter) {
            editor.loadChapter(updatedChapter);
          }
        }
      }
    }
    // Handle failed translations
    if (previousStatus === 'processing' && status === 'failed') {
      console.error('Translation failed:', translation.currentJobData?.errorMessage);
    }
  }
);

</script>
