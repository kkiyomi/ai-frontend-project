/**
 * Glossary Module - Store
 *
 * Reactive state management for glossary terms.
 * Uses the Glossary API layer which handles mock/real switching internally.
 */

import { ref, computed } from 'vue';
import { glossaryAPI } from './api';
import type { GlossaryTerm } from './types';

const terms = ref<GlossaryTerm[]>([]);
const isLoading = ref(false);
const isGlossaryVisible = ref(false);
const isHighlightEnabled = ref(false);

const currentSeriesId = ref<string | undefined>();
const currentChapterId = ref<string | undefined>();

const termsByCategory = computed(() => {
  const grouped: Record<string, GlossaryTerm[]> = {};
  termsByCurrentChapter.value.forEach(term => {
    if (!grouped[term.category]) {
      grouped[term.category] = [];
    }
    grouped[term.category].push(term);
  });
  return grouped;
});

const termsByCurrentChapter = computed(() => {
  return getFilteredTerms(terms.value, currentSeriesId.value, currentChapterId.value);
});

function getFilteredTerms(terms: GlossaryTerm[], currentSeriesId?: string, currentChapterId?: string) {
  if (!currentSeriesId) return [];

  if (!currentChapterId) {
    return terms.filter(term => term.seriesId === currentSeriesId);
  }

  const filteredTerms = terms.filter(term =>
    (term.chapterId === null && term.seriesId === currentSeriesId) ||
    (term.chapterId !== null && term.chapterId === currentChapterId) ||
    (Array.isArray(term.chapterIds) && term.chapterIds.includes(currentChapterId))
  );

  return filteredTerms;
}


async function loadTerms(seriesId?: string, chapterId?: string) {
  if (!seriesId) {
    return;
  }

  isLoading.value = true;
  currentSeriesId.value = seriesId;
  currentChapterId.value = chapterId;

  try {
    const response = await glossaryAPI.getGlossaryTerms(seriesId, chapterId);
    if (response.success && response.data) {
      let filteredTerms: GlossaryTerm[];
      filteredTerms = getFilteredTerms(response.data, seriesId, chapterId);
      terms.value = [
        ...terms.value.filter(t => !filteredTerms.some(nt => nt.id === t.id)),
        ...filteredTerms
      ];
    }
  } catch (error) {
    console.error('[Glossary Store] Error loading glossary terms:', error);
  } finally {
    isLoading.value = false;
  }
}

async function addTerm(term: Omit<GlossaryTerm, 'id' | 'frequency'>) {
  try {
    const response = await glossaryAPI.createGlossaryTerm(term);
    if (response.success && response.data) {
      terms.value.push(response.data);
    } else {
      console.error('[Glossary Store] Failed to create glossary term:', response.error);
    }
  } catch (error) {
    console.error('[Glossary Store] Error creating glossary term:', error);
  }
}

async function updateTerm(termId: string, updates: Partial<GlossaryTerm>) {
  try {
    const response = await glossaryAPI.updateGlossaryTerm(termId, updates);
    if (response.success && response.data) {
      const index = terms.value.findIndex(term => term.id === termId);
      if (index !== -1) {
        terms.value[index] = response.data;
      }
    } else {
      console.error('[Glossary Store] Failed to update glossary term:', response.error);
    }
  } catch (error) {
    console.error('[Glossary Store] Error updating glossary term:', error);
  }
}

async function removeTerm(termId: string) {
  try {
    const response = await glossaryAPI.deleteGlossaryTerm(termId);
    if (response.success) {
      terms.value = terms.value.filter(term => term.id !== termId);
    } else {
      console.error('[Glossary Store] Failed to delete glossary term:', response.error);
    }
  } catch (error) {
    console.error('[Glossary Store] Error deleting glossary term:', error);
  }
}

function findTermByText(text: string): GlossaryTerm | undefined {
  return terms.value.find(term =>
    term.term.toLowerCase() === text.toLowerCase()
  );
}

async function termExistsInSeries(termText: string): Promise<boolean> {
  if (!currentSeriesId.value) return false;

  try {
    const response = await glossaryAPI.getGlossaryTerms(currentSeriesId.value);
    const seriesTerms = response.success && response.data ? response.data : [];
    return seriesTerms.some(term => term.term.toLowerCase() === termText.toLowerCase());
  } catch (error) {
    console.error('[Glossary Store] Error loading series terms:', error);
    return false;
  }
}

function suggestTermsFromText(text: string): string[] {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const frequency: Record<string, number> = {};

  words.forEach(word => {
    if (word.length > 3) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });

  return Object.entries(frequency)
    .filter(([_, count]) => count >= 3)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 10)
    .map(([word, _]) => word);
}

function highlightTermsInText(text: string): string {
  let highlightedText = text;
  const sortedTerms = terms.value
    .slice()
    .sort((a, b) => Math.max(b.term.length, b.translation.length) - Math.max(a.term.length, a.translation.length));

  sortedTerms.forEach(term => {
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(
      `${escapeRegex(term.term)}|${escapeRegex(term.translation)}`,
      "gi"
    );

    highlightedText = highlightedText.replace(
      regex,
      `<span class="glossary-highlight glossary-popup" data-term-id="${term.id}">$&</span>`
    );
  });

  return highlightedText;
}

function toggleVisibility() {
  isGlossaryVisible.value = !isGlossaryVisible.value;
}

function toggleHighlight() {
  isHighlightEnabled.value = !isHighlightEnabled.value;
}

export function useGlossaryStore() {
  return {
    terms: computed(() => terms.value),
    termsByCurrentChapter,
    isLoading: computed(() => isLoading.value),
    isGlossaryVisible: computed(() => isGlossaryVisible.value),
    isHighlightEnabled: computed(() => isHighlightEnabled.value),
    termsByCategory,
    currentSeriesId: computed(() => currentSeriesId.value),
    currentChapterId: computed(() => currentChapterId.value),
    loadTerms,
    addTerm,
    updateTerm,
    removeTerm,
    findTermByText,
    termExistsInSeries,
    suggestTermsFromText,
    highlightTermsInText,
    toggleVisibility,
    toggleHighlight,
  };
}
