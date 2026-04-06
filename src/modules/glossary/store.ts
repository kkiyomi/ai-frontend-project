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
import type { GlossaryTerm, GlossaryItem } from './types';

export const useGlossaryStore = defineStore('glossary', () => {
  // State
  const terms = ref<GlossaryTerm[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isGlossaryVisible = ref(false);
  const isHighlightEnabled = ref(true);
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

  const termsByCategoryFlat = computed<GlossaryItem[]>(() => {
    const items: GlossaryItem[] = []

    for (const [category, flatTerms] of Object.entries(termsByCategory.value as Record<string, GlossaryTerm[]>)) {
      items.push({
        type: "header",
        id: `header-${category}`,
        category,
        count: flatTerms.length
      } as GlossaryItem)

      for (const term of flatTerms) {
        items.push({
          type: "term",
          ...term,
          category
        } as GlossaryItem)
      }
    }

    return items
  })

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
      (!term.chapterId && term.seriesId === seriesId) ||
      (term.chapterId && term.chapterId === chapterId) ||
      (Array.isArray(term.chapterIds) && term.chapterIds.includes(chapterId))
    );

    return filteredTerms;
  }

  // Actions
  function getTermsByContext(seriesId: string, chapterId?: string) {
    return getFilteredTerms(terms.value, seriesId, chapterId);
  }

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
        filteredTerms.forEach(newTerm => {
          const index = terms.value.findIndex(t => t.id === newTerm.id);

          if (index !== -1) {
            terms.value[index] = newTerm; // update existing
          } else {
            terms.value.push(newTerm); // add new
          }
        });
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

  function buildHighlightPatterns() {
    const terms = termsByCurrentChapter.value;
    if (!terms.length) return null;

    const escapeRegex = (s: string) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const termMap = new Map<string, string>();
    const patterns: string[] = [];

    for (const t of terms) {
      const term = t.term.trim();
      const translation = t.translation.trim();

      if (term) {
        termMap.set(term.toLowerCase(), t.id);
        patterns.push(escapeRegex(term));
      }

      if (translation) {
        termMap.set(translation.toLowerCase(), t.id);
        patterns.push(escapeRegex(translation));
      }
    }

    if (!patterns.length) return null;

    patterns.sort((a, b) => b.length - a.length);

    // chunk to avoid huge regex
    const chunkSize = 300;
    const chunks: RegExp[] = [];

    for (let i = 0; i < patterns.length; i += chunkSize) {
      chunks.push(new RegExp(`(${patterns.slice(i, i + chunkSize).join("|")})`, "gi"));
    }

    return { termMap, patterns, chunks };
  }

  function highlightTermsInTextWithPatterns(text: string, patterns: ReturnType<typeof buildHighlightPatterns>): string {
    if (!patterns || !text) return text;

    const { termMap, chunks } = patterns;

    // Parse HTML safely
    const container = document.createElement("div");
    container.innerHTML = text;

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT
    );

    const textNodes: Text[] = [];
    let node;
    while ((node = walker.nextNode())) {
      // skip already highlighted nodes
      if ((node.parentElement as HTMLElement)?.classList?.contains("glossary-highlight")) {
        continue;
      }
      textNodes.push(node as Text);
    }

    for (const textNode of textNodes) {
      let content = textNode.nodeValue;
      if (!content) continue;

      let replaced = false;

      for (const regex of chunks) {
        // Reset lastIndex for global regex
        regex.lastIndex = 0;
        if (!regex.test(content)) continue;

        replaced = true;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        // Reset lastIndex before replace
        regex.lastIndex = 0;
        content.replace(regex, (match, _, offset) => {
          const id = termMap.get(match.toLowerCase());
          if (!id) return match;

          // text before match
          if (offset > lastIndex) {
            fragment.appendChild(
              document.createTextNode(content!.slice(lastIndex, offset))
            );
          }

          // span
          const span = document.createElement("span");
          span.className = "glossary-highlight glossary-popup";
          span.dataset.termId = id;
          span.textContent = match;

          fragment.appendChild(span);

          lastIndex = offset + match.length;
          return match;
        });

        if (lastIndex < content.length) {
          fragment.appendChild(
            document.createTextNode(content.slice(lastIndex))
          );
        }

        textNode.replaceWith(fragment);
        break; // important: don't reprocess newly inserted nodes
      }

      if (replaced) continue;
    }

    return container.innerHTML;
  }

  function highlightTermsInText(text: string): string {
    const terms = termsByCurrentChapter.value;
    if (!terms.length || !text) return text;
    
    const patterns = buildHighlightPatterns();
    if (!patterns) return text;
    
    return highlightTermsInTextWithPatterns(text, patterns);
  }

  function highlightTermsInTexts(texts: string[]): string[] {
    const terms = termsByCurrentChapter.value;
    if (!terms.length || !texts.length) return texts;
    
    const patterns = buildHighlightPatterns();
    if (!patterns) return texts;
    
    return texts.map(text => 
      text ? highlightTermsInTextWithPatterns(text, patterns) : text
    );
  }

  function toggleVisibility() {
    isGlossaryVisible.value = !isGlossaryVisible.value;
  }

  function toggleHighlight() {
    isHighlightEnabled.value = !isHighlightEnabled.value;
    localStorage.setItem('glossary:isHighlightEnabled', String(isHighlightEnabled.value));
  }

  function clearError() {
    error.value = null;
  }

  function loadPreferences() {
    const savedIisHighlight = localStorage.getItem('glossary:isHighlightEnabled');

    if (savedIisHighlight !== null) {
      isHighlightEnabled.value = savedIisHighlight === 'true';
    }
  }

  // Initialize preferences
  loadPreferences()

  return {
    // State
    terms,
    isLoading,
    error,
    isGlossaryVisible,
    isHighlightEnabled,
    currentSeriesId,
    currentChapterId,
    
    // Computed
    termsByCategory,
    termsByCurrentChapter,
    termsByCategoryFlat,
    
    // Actions
    getTermsByContext,
    loadTerms,
    addTerm,
    updateTerm,
    removeTerm,
    findTermByText,
    termExistsInSeries,
    suggestTermsFromText,
    highlightTermsInText,
    highlightTermsInTexts,
    toggleVisibility,
    toggleHighlight,
    clearError,
  };
});
