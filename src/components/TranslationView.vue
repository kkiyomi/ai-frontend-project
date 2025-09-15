<template>
  <div class="flex-1 flex flex-col h-full bg-white">
    <!-- Header -->
    <div class="border-b border-secondary-200 p-4">
      <div class="flex items-center justify-between">
        <div v-if="currentChapter">
          <h2 class="text-lg font-semibold text-secondary-900">{{ currentChapter.title }}</h2>
          <p class="text-sm text-secondary-500">
            {{ currentChapter.originalParagraphs.length }} original paragraphs
            <span v-if="currentChapter.translatedParagraphs.length > 0">
              • {{ currentChapter.translatedParagraphs.length }} translated paragraphs
            </span>
          </p>
        </div>
        <div v-else class="text-secondary-500">
          Select a chapter to begin translation
        </div>
        
        <div v-if="currentChapter" class="flex items-center space-x-2">
          <ShareButton />
          <button
            @click="toggleEditMode"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
          >
            {{ isEditingOriginal ? 'Save Changes' : 'Edit Original' }}
          </button>
          <button
            @click="toggleLayoutMode"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
          >
            {{ layoutMode === 'split' ? 'Full Text View' : 'Split View' }}
          </button>
          <button
            @click="toggleContentMode"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
          >
            {{ contentMode === 'all' ? 'Translated Only' : 'Show All' }}
          </button>
          <button
            @click="toggleHighlight"
            class="px-4 py-2 rounded-lg transition-colors text-sm font-medium border"
            :class="isHighlightEnabled ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-700 border-gray-300'"
          >
            {{ isHighlightEnabled ? 'Hide Highlights' : 'Highlight Terms' }}
          </button>
          <button
            @click="translateAllParagraphs"
            :disabled="isTranslating"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-blue-700"
          >
            {{ isTranslating ? 'Translating...' : 'Translate All' }}
          </button>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div v-if="isTranslating" class="mt-3">
        <div class="bg-gray-200 rounded-full h-3">
          <div 
            class="bg-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm"
            :style="{ width: `${translationProgress}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-2 font-medium">{{ Math.round(translationProgress) }}% complete</p>
      </div>
    </div>

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
        <!-- Original Text Column -->
        <div v-if="contentMode === 'all'" class="flex-1 border-r border-secondary-200">
          <div class="p-4 bg-secondary-50 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-secondary-900">Original Text</h3>
              <button
                v-if="!isEditingOriginal"
                @click="toggleEditMode"
                class="text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
          <div class="p-4 overflow-y-auto h-full pb-20">
            <div class="space-y-6 max-w-2xl">
              <div
                v-for="(paragraph, index) in currentChapter.originalParagraphs"
                :key="`orig-${index}`"
                class="paragraph-hover border border-transparent rounded-lg p-4 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs text-secondary-500 font-medium">Paragraph {{ index + 1 }}</span>
                  <div class="flex space-x-2">
                    <button
                      v-if="isEditingOriginal"
                      @click="toggleParagraphOriginalEditing(index)"
                      class="text-xs text-blue-600 hover:text-blue-700"
                    >
                      {{ editingOriginalParagraphs.has(index) ? 'Save' : 'Edit' }}
                    </button>
                  </div>
                </div>
                
                <div v-if="!editingOriginalParagraphs.has(index)" 
                     class="reading-text text-secondary-900"
                     v-html="isHighlightEnabled ? highlightTermsInText(paragraph) : paragraph">
                </div>
                
                <textarea
                  v-else
                  v-model="currentChapter.originalParagraphs[index]"
                  @blur="toggleParagraphOriginalEditing(index)"
                  class="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 reading-text resize-none"
                  rows="4"
                  placeholder="Enter original text..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Translated Text Column -->
        <div class="flex-1">
          <div class="p-4 bg-accent-50 border-b border-secondary-200">
            <h3 class="font-medium text-secondary-900">Translation</h3>
          </div>
          <div class="p-4 overflow-y-auto h-full pb-20">
            <div class="space-y-6 max-w-2xl">
              <div
                v-for="(paragraph, index) in currentChapter.translatedParagraphs"
                :key="`trans-${index}`"
                class="paragraph-hover border border-transparent rounded-lg p-4 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs text-secondary-500 font-medium">Translation {{ index + 1 }}</span>
                  <div class="flex space-x-2">
                    <button
                      @click="toggleParagraphTranslatedEditing(index)"
                      class="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {{ editingTranslatedParagraphs.has(index) ? 'Save' : 'Edit' }}
                    </button>
                  </div>
                </div>
                
                <div v-if="!editingTranslatedParagraphs.has(index)" class="reading-text text-secondary-900">
                  <div v-if="paragraph" v-html="isHighlightEnabled ? highlightTermsInText(paragraph) : paragraph"></div>
                  <div v-else class="text-secondary-400 italic">No translation yet</div>
                </div>
                
                <textarea
                  v-else
                  v-model="currentChapter.translatedParagraphs[index]"
                  @blur="toggleParagraphTranslatedEditing(index)"
                  class="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 reading-text resize-none"
                  rows="4"
                  placeholder="Enter translation..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Text View -->
      <div v-else class="h-full flex">
        <!-- Original Text Column -->
        <div v-if="contentMode === 'all'" class="flex-1 border-r border-secondary-200">
          <div class="p-4 bg-secondary-50 border-b border-secondary-200">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-secondary-900">Original Text</h3>
              <button
                v-if="!isEditingOriginal"
                @click="toggleEditMode"
                class="text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
          <div class="p-4 overflow-y-auto h-full pb-20">
            <div class="max-w-4xl">
              <div v-if="!isEditingOriginal" 
                   class="reading-text text-secondary-900 leading-relaxed space-y-4"
                   v-html="isHighlightEnabled ? highlightTermsInText(getFullOriginalText()) : getFullOriginalText()">
              </div>
              
              <textarea
                v-else
                v-model="fullOriginalText"
                @blur="saveFullOriginalText"
                class="w-full h-96 p-4 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 reading-text resize-none"
                placeholder="Enter original text..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Translated Text Column -->
        <div class="flex-1">
          <div class="p-4 bg-accent-50 border-b border-secondary-200">
            <h3 class="font-medium text-secondary-900">Translation</h3>
          </div>
          <div class="p-4 overflow-y-auto h-full pb-20">
            <div v-if="layoutMode === 'full'" class="max-w-4xl">
              <div v-if="getFullTranslatedText()" class="reading-text text-secondary-900 leading-relaxed space-y-4">
                <div v-html="isHighlightEnabled ? highlightTermsInText(getFullTranslatedText()) : getFullTranslatedText()"></div>
              </div>
              <div v-else class="text-secondary-400 italic">
                No translations yet. Use "Translate All" or translate individual paragraphs first.
              </div>
            </div>
            <div v-else class="space-y-6 max-w-2xl">
              <div
                v-for="(paragraph, index) in currentChapter.translatedParagraphs"
                :key="`trans-only-${index}`"
                class="paragraph-hover border border-transparent rounded-lg p-4 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs text-secondary-500 font-medium">Translation {{ index + 1 }}</span>
                  <div class="flex space-x-2">
                    <button
                      @click="toggleParagraphTranslatedEditing(index)"
                      class="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {{ editingTranslatedParagraphs.has(index) ? 'Save' : 'Edit' }}
                    </button>
                  </div>
                </div>

                <div v-if="!editingTranslatedParagraphs.has(index)" class="reading-text text-secondary-900">
                  <div v-if="paragraph" v-html="isHighlightEnabled ? highlightTermsInText(paragraph) : paragraph"></div>
                  <div v-else class="text-secondary-400 italic">No translation yet</div>
                </div>

                <textarea
                  v-else
                  v-model="currentChapter.translatedParagraphs[index]"
                  @blur="toggleParagraphTranslatedEditing(index)"
                  class="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 reading-text resize-none"
                  rows="4"
                  placeholder="Enter translation..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
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
import ShareButton from './ShareButton.vue';
import GlossaryTermPopup from './GlossaryTermPopup.vue';
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

const saveFullOriginalText = async () => {
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
  return currentChapter.value.originalParagraphs.join('<br><br>');
};

const getFullTranslatedText = (): string => {
  if (!currentChapter.value) return '';
  const translations = currentChapter.value.translatedParagraphs.filter(text => text.trim());
  
  if (translations.length === 0) return '';
  
  return currentChapter.value.translatedParagraphs.join('<br><br>');
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
      
      // Update via API
      const apiResponse = await updateChapterAPI(currentChapter.value.id, updatedChapter);
      
      if (apiResponse.success) {
        // Update local state
        await updateChapter(currentChapter.value.id, updatedChapter);
      }
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