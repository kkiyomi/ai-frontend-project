<template>
  <div class="h-full bg-base-100 flex flex-col overflow-y-auto" ref="glossaryScrollContainer">
    <!-- Header -->
    <div class="p-4 border-b border-base-300">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-base-content">Glossary</h2>
        <button
          @click="toggleGlossaryVisibility"
          class="btn btn-ghost btn-square btn-sm"
          title="Close glossary"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <p class="text-sm text-base-content/60 mt-1">{{ glossaryTerms.length }} terms defined</p>
      <p v-if="currentSeries && currentChapter" class="text-xs text-primary/70 mt-1">
        {{ currentSeries.name }}
        <br/>
        Chapter: {{ currentChapter.title }}
      </p>
      <p v-else-if="currentSeries" class="text-xs text-green-600 mt-1">
        Series: {{ currentSeries.name }} (series-level terms)
      </p>
      
      <!-- Highlight Terms Toggle -->
      <div class="mt-3">
        <button
          @click="toggleHighlight"
          class="w-full btn btn-md space-x-2"
          :class="isHighlightEnabled ? 'btn-neutral' : 'btn-ghost'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
          </svg>
          <span>{{ isHighlightEnabled ? 'Hide Highlights' : 'Highlight Terms' }}</span>
        </button>
      </div>
      
      <!-- Add Term Button -->
      <div class="mt-3 flex items-center gap-2">
        <button
          v-if="!showAddForm"
          @click="showAddForm = true"
          :disabled="!currentSeries"
          class="flex-1 btn btn-md btn-primary flex items-center justify-center gap-2"
          :class="{ 'btn-disabled': !currentSeries }"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>{{ currentSeries ? 'Add New Term' : 'Select Series First' }}</span>
        </button>

        <GlossaryImportButton
          :series-id="currentSeries?.id"
          :chapter-id="currentChapter?.id"
          :disabled="!currentSeries"
          button-class="btn btn-md btn-ghost text-base-content/40 px-3"
          button-title="Import glossary terms from CSV"
        />
      </div>
    </div>

    <!-- Add Term Form -->
    <GlossaryAddTermForm
      v-if="showAddForm"
      :series="currentSeries"
      :chapter="currentChapter"
      :initial-term="initialTerm"
      @added="showAddForm = false; initialTerm = ''"
      @canceled="showAddForm = false; initialTerm = ''"
    />

    <!-- Terms List -->
    <div class="flex-1 ">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="text-4xl mb-3">⏳</div>
        <p class="text-sm text-base-content/60">Loading glossary terms...</p>
      </div>

      <div v-else-if="!currentChapter" class="p-8 text-center">
        <div class="text-4xl mb-3">📖</div>
        <p class="text-sm text-base-content/60">
          {{ currentSeries ? 'Viewing all glossary terms for this series' : 'Select a series to view its glossary' }}
        </p>
        <p v-if="currentSeries && glossaryTerms.length > 0" class="text-xs text-base-content/40 mt-2">
          Showing {{ glossaryTerms.length }} terms across all chapters
        </p>
        <p v-if="currentSeries && glossaryTerms.length > 0" class="text-xs text-primary/70 mt-1">
          Select a chapter to focus on chapter-specific context
        </p>
      </div>

      <div v-if="!glossaryTerms || glossaryTerms.length === 0" class="p-8 text-center">
        <div class="text-4xl mb-3">📚</div>
        <p class="text-sm text-base-content/60">No glossary terms yet</p>
        <p v-if="currentChapter" class="text-xs text-base-content/40 mt-1">Add terms to improve translations for "{{ currentChapter.title }}"</p>
      </div>

      <div v-else class="p-4 space-y-4">
        <!-- Terms List -->
          <VirtualScrollingList
            :items="termsByCategoryFlat"
            :visible-count="60"
            :buffer="10"
            :scroll-container="scrollContainerProp"
            item-key="id"
            class="space-y-2"
          >
            <template #item="{ item }">
              <!-- Header -->
              <div
                v-if="item.type === 'header'"
                class="text-xs font-semibold text-gray-600 uppercase tracking-wide"
              >
                {{ item.category }} ({{ item.count }})
              </div>

              <!-- Term -->
              <GlossaryTermItem
                v-else
                :term="item"
              />
            </template>
          </VirtualScrollingList>
      </div>
    </div>

    <!-- Suggestions Section -->
    <GlossarySuggestions
      :current-chapter="currentChapter"
      :suggestions="suggestions"
      :is-generating="isGeneratingSuggestions"
      @refresh="generateSuggestions"
      @add-suggestion="addSuggestedTerm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, watchEffect, nextTick, toRef, type ComponentPublicInstance } from "vue";
import { storeToRefs } from 'pinia';
import { useGlossaryStore } from '../store';
import { GlossaryImportButton } from '@/modules/glossary';
import { VirtualScrollingList } from '@/modules/core';

import GlossaryAddTermForm from './GlossaryAddTermForm.vue';
import GlossaryTermItem from './GlossaryTermItem.vue';
import GlossarySuggestions from './GlossarySuggestions.vue';

import type { Chapter, Series } from '@/types';
import type { GlossaryItem } from '../types';

interface Props {
  currentChapter?: Chapter | null;
  currentSeries?: Series | null;
}

const props = defineProps<Props>();

const store = useGlossaryStore();
const state = storeToRefs(store);

const {
  termsByCurrentChapter: glossaryTerms,
  isLoading,
  isHighlightEnabled,
  termsByCategory,
  termsByCategoryFlat,
} = state;

const {
  loadTerms: loadGlossaryTerms,
  suggestTermsFromText,
  toggleVisibility: toggleGlossaryVisibility,
  toggleHighlight
} = store;

const suggestions = ref<string[]>([]);
const isGeneratingSuggestions = ref(false);
const showAddForm = ref(false);
const initialTerm = ref('');

const addSuggestedTerm = (suggestion: string) => {
  initialTerm.value = suggestion;
  showAddForm.value = true;
};

const generateSuggestions = () => {
  if (!props.currentChapter || !props.currentSeries) return;

  isGeneratingSuggestions.value = true;

  setTimeout(() => {
    const allText = props.currentChapter!.content;
    suggestions.value = suggestTermsFromText(allText);
    isGeneratingSuggestions.value = false;
  }, 1000);
};

// Load glossary terms when component mounts or chapter changes
onMounted(() => {
  if (props.currentSeries) {
    loadGlossaryTerms(props.currentSeries.id, props.currentChapter?.id);
  }
  if (props.currentChapter && props.currentSeries) {
    generateSuggestions();
  }
});

// Watch for chapter or series changes and reload glossary
watch([() => props.currentChapter?.id, () => props.currentSeries?.id], () => {
  if (props.currentSeries) {
    loadGlossaryTerms(props.currentSeries.id, props.currentChapter?.id);
  }
  if (props.currentChapter && props.currentSeries) {
    generateSuggestions();
  }
});

const glossaryScrollContainer = ref<HTMLElement | null>(null);
const scrollContainerProp = computed(() => glossaryScrollContainer);


</script>