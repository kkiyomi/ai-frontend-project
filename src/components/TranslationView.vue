<template>
  <div class="flex-1 flex flex-col h-full bg-white">
    <!-- Header -->
    <TranslationHeader
      :currentChapter="currentChapter"
      :isEditingOriginal="isEditingOriginal"
      :layoutMode="layoutMode"
      :contentMode="contentMode"
      :isTranslating="isTranslating"
      :translationProgress="translationProgress"
      @toggleEditMode="toggleEditMode"
      @toggleLayoutMode="toggleLayoutMode"
      @toggleContentMode="toggleContentMode"
      @translateAll="translateAllParagraphs"
    />

    <!-- Content Area -->
    <div v-if="!currentChapter" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">📖</div>
        <h3 class="text-xl font-medium text-secondary-900 mb-2">Ready to Translate</h3>
        <p class="text-secondary-500">Upload a chapter from the sidebar to get started</p>
      </div>
    </div>

    <div v-else class="flex-1 overflow-hidden">
      <!-- Split Paragraph View -->
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
          :highlightTermsInText="highlightTermsInText"
          :isHighlightEnabled="isHighlightEnabled"
          @toggleEdit="toggleEditMode"
          @toggleParagraphEditing="toggleParagraphOriginalEditing"
          @saveParagraph="saveParagraphOriginal"
          @cancelParagraphEdit="cancelParagraphOriginalEdit"
        />

        <TextColumn
          title="Translation"
          :paragraphs="currentChapter.translatedParagraphs"
          mode="paragraph"
          type="translated"
          :editingParagraphs="editingTranslatedParagraphs"
          emptyMessage="No translation yet"
          placeholder="Enter translation..."
          :highlightTermsInText="highlightTermsInText"
          :isHighlightEnabled="isHighlightEnabled"
          @toggleParagraphEditing="toggleParagraphTranslatedEditing"
          @saveParagraph="saveParagraphTranslated"
          @cancelParagraphEdit="cancelParagraphTranslatedEdit"
        />
      </div>

      <!-- Full Text View -->
      <div v-else class="h-full flex">
        <TextColumn
          v-if="contentMode === 'all'"
          title="Original Text"
          :fullText="getFullOriginalText()"
          mode="full"
          type="original"
          :editingParagraphs="editingOriginalParagraphs"
          :isEditingMode="isEditingOriginal"
          :showBorder="true"
          :showEditButton="!isEditingOriginal"
          placeholder="Enter original text..."
          :highlightTermsInText="highlightTermsInText"
          :isHighlightEnabled="isHighlightEnabled"
          @toggleEdit="toggleEditMode"
          @saveFullText="saveFullOriginalText"
        />

        <TextColumn
          title="Translation"
          :fullText="getFullTranslatedText()"
          :paragraphs="currentChapter.translatedParagraphs"
          :mode="layoutMode === 'full' ? 'full' : 'paragraph'"
          type="translated"
          :editingParagraphs="editingTranslatedParagraphs"
          emptyMessage="No translations yet. Use 'Translate All' or translate individual paragraphs first."
          placeholder="Enter translation..."
          :highlightTermsInText="highlightTermsInText"
          :isHighlightEnabled="isHighlightEnabled"
          @toggleParagraphEditing="toggleParagraphTranslatedEditing"
          @saveParagraph="saveParagraphTranslated"
          @cancelParagraphEdit="cancelParagraphTranslatedEdit"
        />
      </div>
    </div>
  </div>

  <!-- Glossary Term Popup -->
  <GlossaryTermPopup
    v-if="showGlossaryPopup && hoveredTerm"
    :term="hoveredTerm"
    :position="popupPosition"
    @update="handleTermUpdate"
    @close="closeGlossaryPopup"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import GlossaryTermPopup from './GlossaryTermPopup.vue';
import TranslationHeader from './TranslationHeader.vue';
import TextColumn from './TextColumn.vue';
import { useChapters } from '../composables/useChapters';
import { useTranslation } from '../composables/useTranslation';
import { useGlossary } from '../composables/useGlossary';
import { useDataAPI, useAPI } from '../composables/useAPI';
import { saveLayoutMode, loadLayoutMode, saveContentMode, loadContentMode } from '../utils/localStorage';
import type { GlossaryTerm } from '../types';

const { 
  currentChapter, 
  updateChapter
} = useChapters();

const { 
  isTranslating, 
  translationProgress, 
  translateChapter 
} = useTranslation();

const { 
  highlightTermsInText, 
  glossaryTerms, 
  isHighlightEnabled, 
  toggleHighlight,
  updateTerm 
} = useGlossary();
const { updateChapter: updateChapterAPI } = useDataAPI();
const { translateText } = useAPI();

const layoutMode = ref<'split' | 'full'>(loadLayoutMode());
const contentMode = ref<'all' | 'translated'>(loadContentMode());
const isEditingOriginal = ref(false);
const fullOriginalText = ref('');
const editingOriginalParagraphs = ref<Set<number>>(new Set());
const editingTranslatedParagraphs = ref<Set<number>>(new Set());

// Glossary popup state
const showGlossaryPopup = ref(false);
const hoveredTerm = ref<GlossaryTerm | null>(null);
const popupPosition = ref({ x: 0, y: 0 });

// Save view modes to localStorage when they change
watch(layoutMode, (newMode) => {
  saveLayoutMode(newMode);
});

watch(contentMode, (newMode) => {
  saveContentMode(newMode);
});

// Update fullOriginalText when chapter changes
watch(() => currentChapter.value, (newChapter) => {
  if (newChapter) {
    fullOriginalText.value = newChapter.originalParagraphs.join('\n\n');
  }
}, { immediate: true });

onMounted(() => {
  if (currentChapter.value) {
    fullOriginalText.value = currentChapter.value.originalParagraphs.join('\n\n');
  }
  
  // Add event listeners for glossary term hover
  document.addEventListener('mouseover', handleGlossaryHover);
  document.addEventListener('mouseout', handleGlossaryMouseOut);
  document.addEventListener('click', handleDocumentClick);
});

const toggleLayoutMode = () => {
  layoutMode.value = layoutMode.value === 'split' ? 'full' : 'split';
};

const toggleContentMode = () => {
  contentMode.value = contentMode.value === 'all' ? 'translated' : 'all';
};

const toggleEditMode = async () => {
  if (isEditingOriginal.value) {
    // Save changes when exiting edit mode
    await saveAllOriginalChanges();
  }
  isEditingOriginal.value = !isEditingOriginal.value;
};

const toggleParagraphOriginalEditing = async (index: number) => {
  if (!currentChapter.value) return;
  
  if (editingOriginalParagraphs.value.has(index)) {
    // Save changes when exiting edit mode
    await saveOriginalParagraphChanges();
    editingOriginalParagraphs.value.delete(index);
  } else {
    editingOriginalParagraphs.value.add(index);
  }
};

const saveParagraphOriginal = async (index: number, content: string) => {
  if (currentChapter.value) {
    currentChapter.value.originalParagraphs[index] = content;
    await saveOriginalParagraphChanges();
    editingOriginalParagraphs.value.delete(index);
  }
};

const cancelParagraphOriginalEdit = (index: number) => {
  editingOriginalParagraphs.value.delete(index);
};

const saveFullOriginalText = async (text: string) => {
  fullOriginalText.value = text;
  await saveFullOriginalText();
};

const toggleParagraphTranslatedEditing = async (index: number) => {
  if (!currentChapter.value) return;
  
  if (editingTranslatedParagraphs.value.has(index)) {
    // Save changes when exiting edit mode
    await saveTranslatedParagraphChanges();
    editingTranslatedParagraphs.value.delete(index);
  } else {
    editingTranslatedParagraphs.value.add(index);
  }
};

const saveParagraphTranslated = async (index: number, content: string) => {
  if (currentChapter.value) {
    currentChapter.value.translatedParagraphs[index] = content;
    await saveTranslatedParagraphChanges();
    editingTranslatedParagraphs.value.delete(index);
  }
};

const cancelParagraphTranslatedEdit = (index: number) => {
  editingTranslatedParagraphs.value.delete(index);
};

const saveOriginalParagraphChanges = async () => {
  if (!currentChapter.value) return;
  
  try {
    // Update via API
    const updatedChapter = {
      ...currentChapter.value,
      content: currentChapter.value.originalParagraphs.join('\n\n'),
    };
    
    const response = await updateChapterAPI(currentChapter.value.id, updatedChapter);
    
    if (response.success) {
      // Update local state
      await updateChapter(currentChapter.value.id, updatedChapter);
    } else {
      console.error('Failed to update chapter:', response.error);
    }
  } catch (error) {
    console.error('Error updating chapter:', error);
  }
};

const saveTranslatedParagraphChanges = async () => {
  if (!currentChapter.value) return;
  
  try {
    // Update via API
    const updatedChapter = {
      ...currentChapter.value,
      translatedContent: currentChapter.value.translatedParagraphs.join('\n\n'),
    };
    
    const response = await updateChapterAPI(currentChapter.value.id, updatedChapter);
    
    if (response.success) {
      // Update local state
      await updateChapter(currentChapter.value.id, updatedChapter);
    } else {
      console.error('Failed to update chapter:', response.error);
    }
  } catch (error) {
    console.error('Error updating chapter:', error);
  }
};

const saveFullOriginalTextInternal = async () => {
  if (!currentChapter.value) return;
  
  try {
    // Split the full text back into paragraphs
    const originalParagraphs = fullOriginalText.value
      .split('\n\n')
      .map(text => text.trim())
      .filter(text => text.length > 0);
    
    const updatedChapter = {
      ...currentChapter.value,
      content: fullOriginalText.value,
      originalParagraphs: originalParagraphs,
    };
    
    // Update via API
    const response = await updateChapterAPI(currentChapter.value.id, updatedChapter);
    
    if (response.success) {
      // Update local state
      await updateChapter(currentChapter.value.id, updatedChapter);
    } else {
      console.error('Failed to update chapter:', response.error);
    }
  } catch (error) {
    console.error('Error updating chapter:', error);
  }
};

const saveAllOriginalChanges = async () => {
  if (!currentChapter.value) return;
  
  try {
    const updatedChapter = {
      ...currentChapter.value,
      content: currentChapter.value.originalParagraphs.join('\n\n'),
    };
    
    // Update via API
    const response = await updateChapterAPI(currentChapter.value.id, updatedChapter);
    
    if (response.success) {
      // Update local state
      await updateChapter(currentChapter.value.id, updatedChapter);
    } else {
      console.error('Failed to update chapter:', response.error);
    }
  } catch (error) {
    console.error('Error updating chapter:', error);
  }
};

const getFullOriginalText = (): string => {
  if (!currentChapter.value) return '';
  return currentChapter.value.originalParagraphs.join('\n\n');
};

const getFullTranslatedText = (): string => {
  if (!currentChapter.value) return '';
  const translations = currentChapter.value.translatedParagraphs.filter(text => text.trim());
  
  if (translations.length === 0) return '';
  
  return currentChapter.value.translatedParagraphs.join('\n\n');
};

const translateAllParagraphs = async () => {
  if (!currentChapter.value) return;
  
  const glossaryContext = glossaryTerms.value.map(term => term.term);
  const fullText = currentChapter.value.content;
  
  try {
    const response = await translateText(fullText, glossaryContext);
    
    if (response.success && response.data) {
      // Update the chapter's translatedContent
      const updatedChapter = {
        ...currentChapter.value,
        translatedContent: response.data,
        translatedParagraphs: response.data.split('\n').map(p => p.trim()).filter(p => p.length > 0)
      };
      await updateChapter(currentChapter.value.id, updatedChapter);

      // Update via API
      // const apiResponse = await updateChapterAPI(currentChapter.value.id, updatedChapter);
      
      // if (apiResponse.success) {
        // Update local state
      //   await updateChapter(currentChapter.value.id, updatedChapter);
      // }
    }
  } catch (error) {
    console.error('Error translating all paragraphs:', error);
  }
};

// Glossary popup handlers
const handleGlossaryHover = (event: MouseEvent) => {
  if (!isHighlightEnabled.value) return;
  
  const target = event.target as HTMLElement;
  if (target.classList.contains('glossary-highlight')) {
    const termId = target.getAttribute('data-term-id');
    if (termId) {
      const term = glossaryTerms.value.find(t => t.id === termId);
      if (term) {
        hoveredTerm.value = term;
        popupPosition.value = {
          x: event.clientX + 10,
          y: event.clientY - 10
        };
        showGlossaryPopup.value = true;
      }
    }
  }
};

const handleGlossaryMouseOut = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const relatedTarget = event.relatedTarget as HTMLElement;
  
  // Don't hide if moving to the popup
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