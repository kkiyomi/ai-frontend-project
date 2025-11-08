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
      :isHighlightEnabled="glossary.isHighlightEnabled.value"
      :isTranslating="translation.isTranslating.value"
      :translationProgress="translation.translationProgress.value"
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
import { ChapterEditor, useEditorStore } from '@/modules/editor';
import {
  useGlossaryStore, useGlossaryPopup,
  GlossaryTermPopup, type GlossaryTerm
} from '@/modules/glossary';
import { useTranslationStore } from '@/modules/translation';
import { useChaptersStore, type Chapter } from '@/modules/chapters';
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

const handleChapterUpdate = async () => {
  const currentEditorChapter = editor.currentChapter;

  if (!currentEditorChapter || !currentEditorChapter.id) {
    return;
  }

  try {
    const updateData = {
      content: currentEditorChapter.content,
      translatedContent: currentEditorChapter.translatedContent,
    };

    await chaptersStore.updateChapter(currentEditorChapter.id, updateData);
    editor.resetSaveFlag();
  } catch (error) {
    console.error('Failed to save chapter:', error);
    editor.resetSaveFlag();
  }
};

watch(
  () => editor.shouldInitiateChapterSave,
  (shouldSave) => {
    if (shouldSave && !editor.hasUnsavedChanges) {
      handleChapterUpdate();
    }
  }
);

</script>
