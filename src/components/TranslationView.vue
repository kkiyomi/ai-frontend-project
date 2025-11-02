<!--
  TranslationView - Integration Component

  This component integrates the Editor module with the Glossary module
  at the application level. It demonstrates proper module decoupling:
  - Editor module handles chapter editing state and operations
  - Glossary module provides term highlighting functionality
  - This component connects them via props (no direct module dependencies)
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
import { ref, computed, onMounted } from 'vue';
import { ChapterEditor } from '@/modules/editor';
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

const translation = useTranslationStore();
const glossary = useGlossaryStore();

const {
  showPopup: showGlossaryPopup,
  hoveredTerm,
  popupPosition,
} = useGlossaryPopup();

const handleChapterUpdate = async (chapterId: string | null, updatedChapter: Chapter | null) => {
  console.log('Chapter updated:', chapterId);
  if (!chapterId) return;
  if (!updatedChapter) return;

  if (currentChapter.value) {
    await chaptersStore.updateChapter(currentChapter.value.id, updatedChapter);
  }
};

</script>
