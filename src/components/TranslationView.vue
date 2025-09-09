<template>
  <div class="flex-1 flex flex-col h-full bg-white">
    <!-- Header -->
    <div class="border-b border-secondary-200 p-4">
      <div class="flex items-center justify-between">
        <div v-if="currentChapter">
          <h2 class="text-lg font-semibold text-secondary-900">{{ currentChapter.title }}</h2>
          <p class="text-sm text-secondary-500">
            {{ currentChapter.paragraphs.length }} paragraphs
          </p>
        </div>
        <div v-else class="text-secondary-500">
          Select a chapter to begin translation
        </div>
        
        <div v-if="currentChapter" class="flex items-center space-x-2">
          <ShareButton />
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
            <h3 class="font-medium text-secondary-900">Original Text</h3>
          </div>
          <div class="p-4 overflow-y-auto h-full pb-20">
            <div class="space-y-6 max-w-2xl">
              <div
                v-for="(paragraph, index) in currentChapter.paragraphs"
                :key="paragraph.id"
                class="paragraph-hover border border-transparent rounded-lg p-4 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs text-secondary-500 font-medium">Paragraph {{ index + 1 }}</span>
                  <button
                    @click="translateSingleParagraph(paragraph.id, paragraph.originalText)"
                    :disabled="isTranslating"
                    class="text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
                  >
                    Translate
                  </button>
                </div>
                <div 
                  class="reading-text text-secondary-900"
                  v-html="highlightTermsInText(paragraph.originalText)"
                ></div>
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
                v-for="(paragraph, index) in currentChapter.paragraphs"
                :key="`trans-${paragraph.id}`"
                class="paragraph-hover border border-transparent rounded-lg p-4 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs text-secondary-500 font-medium">Translation {{ index + 1 }}</span>
                  <div class="flex space-x-2">
                    <button
                      @click="retranslateParagraph(paragraph)"
                      :disabled="isTranslating || !paragraph.translatedText"
                      class="text-xs text-accent-600 hover:text-accent-700 disabled:opacity-50"
                      title="Retranslate with current glossary"
                    >
                      Retranslate
                    </button>
                    <button
                      @click="toggleParagraphEditing(paragraph.id)"
                      class="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {{ paragraph.isEditing ? 'Save' : 'Edit' }}
                    </button>
                  </div>
                </div>
                
                <div v-if="!paragraph.isEditing" class="reading-text text-secondary-900">
                  <div v-if="paragraph.translatedText" v-html="highlightTermsInText(paragraph.translatedText)"></div>
                  <div v-else class="text-secondary-400 italic">No translation yet</div>
                </div>
                
                <textarea
                  v-else
                  v-model="paragraph.translatedText"
                  @blur="toggleParagraphEditing(paragraph.id)"
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
            <h3 class="font-medium text-secondary-900">Original Text</h3>
          </div>
          <div class="p-4 overflow-y-auto h-full pb-20">
            <div class="max-w-4xl">
              <div 
                class="reading-text text-secondary-900 leading-relaxed space-y-4"
                v-html="highlightTermsInText(getFullOriginalText())"
              ></div>
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
                <div v-html="highlightTermsInText(getFullTranslatedText())"></div>
              </div>
              <div v-else class="text-secondary-400 italic">
                No translations yet. Use "Translate All" or translate individual paragraphs first.
              </div>
            </div>
            <div v-else class="space-y-6 max-w-2xl">
              <div
                v-for="(paragraph, index) in currentChapter.paragraphs"
                :key="`trans-only-${paragraph.id}`"
                class="paragraph-hover border border-transparent rounded-lg p-4 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs text-secondary-500 font-medium">Translation {{ index + 1 }}</span>
                  <div class="flex space-x-2">
                    <button
                      @click="retranslateParagraph(paragraph)"
                      :disabled="isTranslating || !paragraph.translatedText"
                      class="text-xs text-accent-600 hover:text-accent-700 disabled:opacity-50"
                      title="Retranslate with current glossary"
                    >
                      Retranslate
                    </button>
                    <button
                      @click="toggleParagraphEditing(paragraph.id)"
                      class="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {{ paragraph.isEditing ? 'Save' : 'Edit' }}
                    </button>
                  </div>
                </div>

                <div v-if="!paragraph.isEditing" class="reading-text text-secondary-900">
                  <div v-if="paragraph.translatedText" v-html="highlightTermsInText(paragraph.translatedText)"></div>
                  <div v-else class="text-secondary-400 italic">No translation yet</div>
                </div>

                <textarea
                  v-else
                  v-model="paragraph.translatedText"
                  @blur="toggleParagraphEditing(paragraph.id)"
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ShareButton from './ShareButton.vue';
import { useChapters } from '../composables/useChapters';
import { useTranslation } from '../composables/useTranslation';
import { useGlossary } from '../composables/useGlossary';
import type { Paragraph } from '../types';

const { 
  currentChapter, 
  updateParagraphTranslation, 
  toggleParagraphEditing 
} = useChapters();

const { 
  isTranslating, 
  translationProgress, 
  translateParagraph, 
  retranslateParagraph: retranslateWithGlossary, 
  translateChapter 
} = useTranslation();

const { highlightTermsInText, glossaryTerms } = useGlossary();

const layoutMode = ref<'split' | 'full'>('split');
const contentMode = ref<'all' | 'translated'>('all');

const toggleLayoutMode = () => {
  layoutMode.value = layoutMode.value === 'split' ? 'full' : 'split';
};

const toggleContentMode = () => {
  contentMode.value = contentMode.value === 'all' ? 'translated' : 'all';
};

const getFullOriginalText = (): string => {
  if (!currentChapter.value) return '';
  return currentChapter.value.paragraphs
    .map(p => p.originalText)
    .join('<br><br>');
};

const getFullTranslatedText = (): string => {
  if (!currentChapter.value) return '';
  const translations = currentChapter.value.paragraphs
    .map(p => p.translatedText)
    .filter(text => text.trim());
  
  if (translations.length === 0) return '';
  
  return currentChapter.value.paragraphs
    .map(p => p.translatedText || '[Not translated yet]')
    .join('<br><br>');
};

const translateSingleParagraph = async (paragraphId: string, originalText: string) => {
  const glossaryContext = glossaryTerms.value.map(term => term.term);
  const translation = await translateParagraph(originalText, glossaryContext);
  updateParagraphTranslation(paragraphId, translation);
};

const retranslateParagraph = async (paragraph: Paragraph) => {
  const glossaryContext = glossaryTerms.value.map(term => term.term);
  const translation = await retranslateWithGlossary(
    paragraph.originalText,
    paragraph.translatedText,
    glossaryContext
  );
  updateParagraphTranslation(paragraph.id, translation);
};

const translateAllParagraphs = async () => {
  if (!currentChapter.value) return;
  
  const glossaryContext = glossaryTerms.value.map(term => term.term);
  const originalTexts = currentChapter.value.paragraphs.map(p => p.originalText);
  const translations = await translateChapter(originalTexts, glossaryContext);
  
  currentChapter.value.paragraphs.forEach((paragraph, index) => {
    updateParagraphTranslation(paragraph.id, translations[index]);
  });
};
</script>