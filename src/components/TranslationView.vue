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
      @toggleEditMode="editor.toggleEditingOriginal()"
      @toggleLayoutMode="editor.toggleLayoutMode()"
      @toggleContentMode="editor.toggleContentMode()"
      @translateAll="translateAllParagraphs"
    />

    <ChapterEditor
      :chapterId="currentChapterId?.toString() || null"
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
    @update="handleTermUpdate"
    @close="closeGlossaryPopup"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ChapterEditor, useEditorStore } from '@/modules/editor';
import { useGlossaryStore, GlossaryTermPopup, type GlossaryTerm } from '@/modules/glossary';
import { useTranslationStore } from '@/modules/translation';
import { useChapters } from '../composables/useChapters';
import { useDataAPI } from '../composables/useAPI';
import TranslationHeader from './TranslationHeader.vue';

const {
  currentChapter,
  currentChapterId,
  updateChapter
} = useChapters();

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
const { updateChapter: updateChapterAPI } = useDataAPI();

const showGlossaryPopup = ref(false);
const hoveredTerm = ref<GlossaryTerm | null>(null);
const popupPosition = ref({ x: 0, y: 0 });

onMounted(() => {
  document.addEventListener('mouseover', handleGlossaryHover);
  document.addEventListener('mouseout', handleGlossaryMouseOut);
  document.addEventListener('click', handleDocumentClick);
});

const translateAllParagraphs = async () => {
  if (!currentChapter.value) return;

  const glossaryContext = glossaryTerms.value.map(term => term.term);
  const fullText = currentChapter.value.content;

  try {
    const translatedText = await translateText(fullText, glossaryContext);

    const updatedChapter = {
      ...currentChapter.value,
      translatedContent: translatedText,
      translatedParagraphs: translatedText.split('\n').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
    };
    await updateChapter(currentChapter.value.id, updatedChapter);
  } catch (error) {
    console.error('Error translating all paragraphs:', error);
  }
};

const handleChapterUpdate = async (chapterId: string) => {
  console.log('Chapter updated:', chapterId);
};

function calculateTooltipPosition(
  event: MouseEvent,
  tooltipEl?: HTMLElement
) {
  const target = event.target as HTMLElement;
  const rect = target.getBoundingClientRect();

  const margin = 8;
  const tooltipWidth = tooltipEl?.offsetWidth || 300;   // Tailwind max-w-sm ≈ 320px
  const tooltipHeight = tooltipEl?.offsetHeight || 180;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Start below the word by default
  let x = rect.left + rect.width / 2 - tooltipWidth / 2;
  let y = rect.bottom + margin;

  // --- Flip horizontally if overflowing right ---
  if (x + tooltipWidth > viewportWidth - margin) {
    x = viewportWidth - tooltipWidth - margin;
  }

  // --- Clamp if overflowing left ---
  if (x < margin) {
    x = margin;
  }

  // --- Flip vertically if overflowing bottom ---
  if (y + tooltipHeight > viewportHeight - margin) {
    y = rect.top - tooltipHeight - margin;
  }

  // --- Clamp top ---
  if (y < margin) {
    y = margin;
  }

  return { x, y };
}

const handleGlossaryHover = (event: MouseEvent) => {
  if (!glossary.isHighlightEnabled) return;

  const target = event.target as HTMLElement;
  if (!target.classList.contains('glossary-highlight')) return;

  const termId = target.getAttribute('data-term-id');
  if (!termId) return;

  const term = glossaryTerms.value.find(t => t.id === termId);
  if (!term) return;

  // Get existing popup element if visible (for measuring)
  const tooltipEl = document.querySelector('div.glossary-popup') as HTMLElement | undefined;

  popupPosition.value = calculateTooltipPosition(event, tooltipEl);
  hoveredTerm.value = term;
  showGlossaryPopup.value = true;
};


const handleGlossaryMouseOut = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const relatedTarget = event.relatedTarget as HTMLElement;

  if (relatedTarget && (relatedTarget.closest('.glossary-popup') || target.classList.contains('glossary-highlight'))) {
    return;
  }

  setTimeout(() => {
    if (!document.querySelector('.glossary-popup:hover')) {
      showGlossaryPopup.value = false;
      hoveredTerm.value = null;
    }
  }, 100);
};

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.glossary-popup') && !target.classList.contains('glossary-highlight')) {
    closeGlossaryPopup();
  }
};

const closeGlossaryPopup = () => {
  showGlossaryPopup.value = false;
  hoveredTerm.value = null;
};

const handleTermUpdate = async (termId: string, updates: Partial<GlossaryTerm>) => {
  await updateTerm(termId, updates);
  closeGlossaryPopup();
};
</script>
