<template>
  <div class="h-full bg-white flex flex-col overflow-y-auto" ref="scrollContainer" @scroll="onScroll">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Glossary</h2>
        <button
          @click="toggleGlossaryVisibility"
          class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Close glossary"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <p class="text-sm text-gray-500 mt-1">{{ glossaryTerms.length }} terms defined</p>
      <p v-if="currentSeries && currentChapter" class="text-xs text-blue-600 mt-1">
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
          class="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
          :class="isHighlightEnabled ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
          </svg>
          <span>{{ isHighlightEnabled ? 'Hide Highlights' : 'Highlight Terms' }}</span>
        </button>
      </div>
      
      <!-- Add Term Button -->
      <div class="mt-3 flex justify-center items-center space-x-2">
        <button
          v-if="!showAddForm"
          @click="showAddForm = true"
          :disabled="!currentSeries"
          class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          :class="{ 'opacity-50 cursor-not-allowed': !currentSeries }"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>{{ currentSeries ? 'Add New Term' : 'Select Series First' }}</span>
        </button>

        <div class="p-2">
          <GlossaryImportButton
            :series-id="currentSeries?.id"
            :chapter-id="currentChapter?.id"
            :disabled="!currentSeries"
            button-class="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            button-title="Import glossary terms from CSV"
          />
        </div>
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
        <p class="text-sm text-gray-500">Loading glossary terms...</p>
      </div>

      <div v-else-if="!currentChapter" class="p-8 text-center">
        <div class="text-4xl mb-3">📖</div>
        <p class="text-sm text-gray-500">
          {{ currentSeries ? 'Viewing all glossary terms for this series' : 'Select a series to view its glossary' }}
        </p>
        <p v-if="currentSeries && glossaryTerms.length > 0" class="text-xs text-gray-400 mt-2">
          Showing {{ glossaryTerms.length }} terms across all chapters
        </p>
        <p v-if="currentSeries && glossaryTerms.length > 0" class="text-xs text-blue-600 mt-1">
          Select a chapter to focus on chapter-specific context
        </p>
      </div>

      <div v-if="!glossaryTerms || glossaryTerms.length === 0" class="p-8 text-center">
        <div class="text-4xl mb-3">📚</div>
        <p class="text-sm text-gray-500">No glossary terms yet</p>
        <p v-if="currentChapter" class="text-xs text-gray-400 mt-1">Add terms to improve translations for "{{ currentChapter.title }}"</p>
      </div>

      <div v-else class="p-4 space-y-4">
        <div
          class="space-y-2"
        >
          <div :style="{ height: topSpacer + 'px' }" />
          <template v-for="(item, i) in visibleItems" :key="item.id">
            <div :ref="el => setItemRef(el, i)">
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
            </div>
          </template>
          <div :style="{ height: bottomSpacer + 'px' }" />
        </div>
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
import { ref, computed, watch, onMounted, onUnmounted, watchEffect, nextTick, type ComponentPublicInstance } from "vue";
import { storeToRefs } from 'pinia';
import { useGlossaryStore } from '../store';
import { GlossaryImportButton } from '@/modules/glossary';

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

const scrollContainer = ref<HTMLElement | null>(null);

const VISIBLE_COUNT = 60;
const BUFFER = 10;

const startIndex = ref(0);
const itemRefs = ref<HTMLElement[]>([]);

// Visible slice
const visibleItems = computed<GlossaryItem[]>(() =>
  termsByCategoryFlat.value.slice(
    startIndex.value,
    startIndex.value + VISIBLE_COUNT
  )
);

// --- Dynamic height tracking ---
const heights = ref<Record<number, number>>({}); // index -> height

function setItemRef(el: Element | ComponentPublicInstance | null, i: number) {
  if (!el) return;
  
  // Extract HTMLElement from Vue ref (could be ComponentPublicInstance)
  const element = (el as ComponentPublicInstance).$el || el as Element;
  
  if (!(element instanceof HTMLElement)) return;
  
  itemRefs.value[i] = element;

  nextTick(() => {
    const h = element.offsetHeight;
    heights.value[startIndex.value + i] = h;
  });
}

// --- Spacer calculations ---
const avgHeight = computed<number>(() => {
  const vals = Object.values(heights.value);
  if (!vals.length) return 40;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
});

const topSpacer = computed<number>(() => {
  return startIndex.value * avgHeight.value;
});

const bottomSpacer = computed<number>(() => {
  const remaining =
    termsByCategoryFlat.value.length -
    (startIndex.value + VISIBLE_COUNT);

  return Math.max(0, remaining * avgHeight.value);
});

// --- IntersectionObserver ---
let observer: IntersectionObserver | undefined;

function handleIntersect(entries: IntersectionObserverEntry[]) {
  const visible = entries
    .filter(e => e.isIntersecting)
    .map(e => itemRefs.value.indexOf(e.target as HTMLElement))
    .sort((a, b) => a - b);

  if (!visible.length) return;

  const first = visible[0];
  const last = visible[visible.length - 1];

  // Scroll down
  if (last >= VISIBLE_COUNT - BUFFER) {
    shiftWindow(startIndex.value + BUFFER);
  }

  // Scroll up
  if (first <= BUFFER) {
    shiftWindow(startIndex.value - BUFFER);
  }
}

function shiftWindow(newStart: number) {
  const maxStart =
    termsByCategoryFlat.value.length - VISIBLE_COUNT;

  startIndex.value = Math.max(0, Math.min(newStart, maxStart));
}

function onScroll() {
  const el = scrollContainer.value;
  if (!el) return;

  const scrollTop = el.scrollTop;
  const viewport = el.clientHeight;

  // Approximate current index
  const estimatedIndex = Math.floor(scrollTop / avgHeight.value);

  // If user jumps far, force sync
  if (Math.abs(estimatedIndex - startIndex.value) > VISIBLE_COUNT) {
    shiftWindow(estimatedIndex - BUFFER);
  }
}

// --- Setup observer ---
onMounted(() => {
  observer = new IntersectionObserver(handleIntersect, {
    root: scrollContainer.value,
    threshold: 0.1
  });

  watchEffect(() => {
    if (!observer) return;
    observer.disconnect();
    itemRefs.value.forEach(el => el && observer!.observe(el));
  });
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>