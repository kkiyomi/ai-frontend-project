<!--
  TranslationView - Integration Component

  This component integrates the Editor module with the Glossary module
  at the application level. It demonstrates proper module decoupling:
  - Editor module handles chapter editing state and operations
  - Glossary module provides term highlighting functionality
  - This component connects them via props (no direct module dependencies)
-->
<template>
  <div class="flex-1 flex flex-col h-full bg-white">
    <TranslationHeader
      :currentChapter="currentChapter"
      :isEditingOriginal="editor.isEditingOriginal"
      :layoutMode="editor.layoutMode"
      :contentMode="editor.contentMode"
      :isTranslating="translation.isTranslating.value"
      :translationProgress="translation.translationProgress.value"
      @translateAll="translateAllParagraphs"
    />

    <ChapterEditor
      :chapterId="currentChapterId || null"
      :highlightTermsInText="glossary.highlightTermsInText"
      :isHighlightEnabled="glossary.isHighlightEnabled.value"
      :isTranslating="translation.isTranslating.value"
      :translationProgress="translation.translationProgress.value"
      @translateAll="translateAllParagraphs"
      @chapterUpdated="handleChapterUpdate"
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
import { ChapterEditor, useEditorStore } from '@/modules/editor';
import {
  useGlossaryStore,
  useGlossaryPopup,
  GlossaryTermPopup,
  type GlossaryTerm
} from '@/modules/glossary';
import { useTranslationStore } from '@/modules/translation';
import { useChaptersStore } from '@/modules/chapters';
import TranslationHeader from './TranslationHeader.vue';

const chaptersStore = useChaptersStore();
const currentChapter = computed(() => chaptersStore.currentChapter);
const currentChapterId = computed(() => chaptersStore.currentChapterId);

const editor = useEditorStore();
const translation = useTranslationStore();
const {
  isTranslating,
  translationProgress,
  translateParagraph: translateText,
} = translation;

const glossary = useGlossaryStore();
const {
  terms: glossaryTerms,
  updateTerm
} = glossary;

const {
  showPopup: showGlossaryPopup,
  hoveredTerm,
  popupPosition,
} = useGlossaryPopup();

const translateAllParagraphs = async () => {
  if (!currentChapter.value) return;

  const glossaryContext = glossaryTerms.value.map(term => term.term);
  const fullText = currentChapter.value.content;

  try {
    const translatedText = await translateText(fullText, glossaryContext);

    const updatedChapter = {
      translatedContent: translatedText,
      translatedParagraphs: translatedText.split('\n').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
    };
    await chaptersStore.updateChapter(currentChapter.value.id, updatedChapter);
  } catch (error) {
    console.error('Error translating all paragraphs:', error);
  }
};

const handleChapterUpdate = async (chapterId: string) => {
  console.log('Chapter updated:', chapterId);
};

</script>
