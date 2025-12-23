/**
 * Glossary Module - Pinia Store
 *
 * Reactive state management for glossary terms with support for series and chapter-level organization.
 * Features include: term highlighting in text content, smart term suggestions from text,
 * contextual filtering by series/chapter, and category-based grouping. Note: Popup display
 * functionality is handled by the separate `useGlossaryPopup` composable.
 * Integrates with glossary API layer with automatic mock/real switching.
 *
 * Usage Example:
 * ```typescript
 * import { useGlossaryStore } from '@/modules/glossary';
 *
 * const glossary = useGlossaryStore();
 * await glossary.loadTerms('series-id');
 *
 * // Add a term
 * glossary.addTerm({ term: 'example', translation: 'translation' });
 *
 * // Highlight terms in text
 * const highlighted = glossary.highlightTermsInText('Some text with terms');
 *
 * // Get smart term suggestions
 * const suggestions = glossary.suggestTermsFromText('text with potential terms');
 *
 * // Toggle highlight visibility
 * glossary.toggleHighlight();
 * ```
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { glossaryAPI } from './api';
import type { GlossaryTerm } from './types';

export const useGlossaryStore = defineStore('glossary', () => {
  // State
  const terms = ref<GlossaryTerm[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isGlossaryVisible = ref(false);
  const isHighlightEnabled = ref(false);
  const currentSeriesId = ref<string | undefined>();
  const currentChapterId = ref<string | undefined>();

  // Computed
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

  // Helper function
  function getFilteredTerms(termsList: GlossaryTerm[], seriesId?: string, chapterId?: string) {
    if (!seriesId) return [];

    if (!chapterId) {
      return termsList.filter(term => term.seriesId === seriesId);
    }

    const filteredTerms = termsList.filter(term =>
      (term.chapterId === null && term.seriesId === seriesId) ||
      (term.chapterId !== null && term.chapterId === chapterId) ||
      (Array.isArray(term.chapterIds) && term.chapterIds.includes(chapterId))
    );

    return filteredTerms;
  }

  // Actions
  async function loadTerms(seriesId?: string, chapterId?: string) {
    if (!seriesId) {
      return;
    }

    isLoading.value = true;
    error.value = null;
    currentSeriesId.value = seriesId;
    currentChapterId.value = chapterId;

    try {
      const response = await glossaryAPI.getGlossaryTerms(seriesId, chapterId);
      if (response.success && response.data) {
        const filteredTerms = getFilteredTerms(response.data, seriesId, chapterId);
        terms.value = [
          ...terms.value.filter(t => !filteredTerms.some(nt => nt.id === t.id)),
          ...filteredTerms
        ];
      } else {
        error.value = response.error || 'Failed to load glossary terms';
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Glossary Store] Error loading glossary terms:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function addTerm(term: Omit<GlossaryTerm, 'id' | 'frequency'>) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await glossaryAPI.createGlossaryTerm(term);
      if (response.success && response.data) {
        terms.value.push(response.data);
        return response.data;
      } else {
        error.value = response.error || 'Failed to create glossary term';
        return null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Glossary Store] Error creating glossary term:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateTerm(termId: string, updates: Partial<GlossaryTerm>) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await glossaryAPI.updateGlossaryTerm(termId, updates);
      if (response.success && response.data) {
        const index = terms.value.findIndex(term => term.id === termId);
        if (index !== -1) {
          terms.value[index] = response.data;
        }
        return response.data;
      } else {
        error.value = response.error || 'Failed to update glossary term';
        return null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Glossary Store] Error updating glossary term:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function removeTerm(termId: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await glossaryAPI.deleteGlossaryTerm(termId);
      if (response.success) {
        terms.value = terms.value.filter(term => term.id !== termId);
        return true;
      } else {
        error.value = response.error || 'Failed to delete glossary term';
        return false;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Glossary Store] Error deleting glossary term:', err);
      return false;
    } finally {
      isLoading.value = false;
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
    console.log('toggleVisibility')
    console.log(isGlossaryVisible)
    console.log(isGlossaryVisible.value)
    isGlossaryVisible.value = !isGlossaryVisible.value;
  }

  function toggleHighlight() {
    isHighlightEnabled.value = !isHighlightEnabled.value;
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    terms: computed(() => terms.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isGlossaryVisible: computed(() => isGlossaryVisible.value),
    isHighlightEnabled: computed(() => isHighlightEnabled.value),
    currentSeriesId: computed(() => currentSeriesId.value),
    currentChapterId: computed(() => currentChapterId.value),
    
    // Computed
    termsByCategory,
    termsByCurrentChapter,
    
    // Actions
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
    clearError,
  };
});
