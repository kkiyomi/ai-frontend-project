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
import { ref, computed, watch } from 'vue';
import { glossaryAPI } from './api';
import type { GlossaryTerm, GlossaryItem } from './types';
import type { CacheOptions } from '@/modules/core';

export const useGlossaryStore = defineStore('glossary', () => {
  // State
  const terms = ref<GlossaryTerm[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isGlossaryVisible = ref(false);
  const isHighlightEnabled = ref(true);
  const showSeriesLevelTerms = ref(true);
  const currentSeriesId = ref<string | undefined>();
  const currentChapterId = ref<string | undefined>();

  /** Tracks which paired occurrence index we last scrolled to per term. */
  const termOccurrenceIndex = ref<Record<string, number>>({});

  /** Group highlighted spans by their scrollable text column. */
  function groupSpansByColumn(
    termId: string
  ): { orig: HTMLElement[]; trans: HTMLElement[] } {
    const all = document.querySelectorAll<HTMLElement>(
      `.glossary-highlight[data-term-id="${termId}"]`
    );
    const orig: HTMLElement[] = [];
    const trans: HTMLElement[] = [];

    for (const span of all) {
      const col = span.closest('.overflow-y-auto') as HTMLElement | null;
      if (!col) continue;
      // The first overflow-y-auto column in DOM order is the original
      if (orig.length === 0 || col === orig[0].closest('.overflow-y-auto')) {
        orig.push(span);
      } else {
        trans.push(span);
      }
    }

    return { orig, trans };
  }

  /** Flash a span to draw attention — distinct ring+glow so it stands out from regular highlights. */
  function flashSpan(el: HTMLElement) {
    el.style.transition = 'box-shadow 0.15s ease, background-color 0.15s ease';
    el.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.6), 0 0 12px rgba(245, 158, 11, 0.35)';
    el.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
    el.style.borderRadius = '3px';
    setTimeout(() => {
      el.style.boxShadow = '';
      el.style.backgroundColor = '';
      el.style.borderRadius = '';
    }, 1800);
  }

  /**
   * Scroll to a glossary term's next paired occurrence in both text columns.
   *
   * Groups highlighted spans by column (original / translated), then cycles
   * through them as pairs on repeated clicks. The first call scrolls to the
   * first occurrence in *both* columns simultaneously; subsequent calls
   * advance to the next pair.
   *
   * Returns per-column counts and the current paired index so the caller can
   * show progress (e.g. "Occurrence 3 / 5 in original, 3 / 3 in translated").
   */
  function scrollToTermOccurrence(termId: string): {
    origCount: number;
    transCount: number;
    currentPair: number;
    totalPairs: number;
  } | null {
    const { orig, trans } = groupSpansByColumn(termId);
    const totalPairs = Math.max(orig.length, trans.length);

    if (totalPairs === 0) return null;

    const prevIdx = termOccurrenceIndex.value[termId] ?? -1;
    const nextIdx = (prevIdx + 1) % totalPairs;

    // Scroll to the nth occurrence in each column (if it exists)
    if (nextIdx < orig.length) {
      orig[nextIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      flashSpan(orig[nextIdx]);
    }
    if (nextIdx < trans.length) {
      trans[nextIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      flashSpan(trans[nextIdx]);
    }

    termOccurrenceIndex.value = { ...termOccurrenceIndex.value, [termId]: nextIdx };

    return {
      origCount: orig.length,
      transCount: trans.length,
      currentPair: nextIdx + 1,
      totalPairs,
    };
  }

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
    return getFilteredTerms(terms.value, currentSeriesId.value, currentChapterId.value, showSeriesLevelTerms.value);
  });

  // Helper function
  function getFilteredTerms(termsList: GlossaryTerm[], seriesId?: string, chapterId?: string, includeSeriesLevel = true) {
    if (!seriesId) return [];

    const seriesTermsList = termsList.filter(term => term.seriesId === seriesId);
    if (!chapterId) {
      return seriesTermsList;
    }

    const filteredTerms = seriesTermsList.filter(term =>
      (!term.chapterId) ||
      (term.chapterId && term.chapterId === chapterId) ||
      (Array.isArray(term.chapterIds) && term.chapterIds.includes(chapterId))
    );

    if (!includeSeriesLevel) {
      return filteredTerms.filter(term =>
        (term.chapterId && term.chapterId === chapterId) ||
        (Array.isArray(term.chapterIds) && term.chapterIds.includes(chapterId))
      );
    }

    return filteredTerms;
  }

  // Actions

  function invalidateCache() {
    glossaryAPI.invalidateCache();
  }

  /** Return terms filtered by series context (used by exporter). */
  function getTermsByContext(seriesId?: string): GlossaryTerm[] {
    return getFilteredTerms(terms.value, seriesId, undefined, true);
  }

  async function loadTerms(seriesId?: string, chapterId?: string, cacheOptions?: CacheOptions) {
    if (!seriesId) {
      return;
    }

    isLoading.value = true;
    error.value = null;
    currentSeriesId.value = seriesId;
    currentChapterId.value = chapterId;

    try {
      const response = await glossaryAPI.getGlossaryTerms(seriesId, chapterId, cacheOptions);
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

  async function addTerm(term: Omit<GlossaryTerm, 'id'>) {
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

  async function termExistsInSeries(termText: string, cacheOptions?: CacheOptions): Promise<boolean> {
    if (!currentSeriesId.value) return false;

    try {
      const response = await glossaryAPI.getGlossaryTerms(currentSeriesId.value, undefined, cacheOptions);
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

  function toggleSeriesLevelTerms() {
    showSeriesLevelTerms.value = !showSeriesLevelTerms.value;
    localStorage.setItem('glossary:showSeriesLevelTerms', String(showSeriesLevelTerms.value));
  }

  function clearError() {
    error.value = null;
  }

  function loadPreferences() {
    const savedIisHighlight = localStorage.getItem('glossary:isHighlightEnabled');
    const savedShowSeriesLevel = localStorage.getItem('glossary:showSeriesLevelTerms');

    if (savedIisHighlight !== null) {
      isHighlightEnabled.value = savedIisHighlight === 'true';
    }
    if (savedShowSeriesLevel !== null) {
      showSeriesLevelTerms.value = savedShowSeriesLevel === 'true';
    }
  }

  // Initialize preferences
  loadPreferences()

  // Reset occurrence tracking when chapter changes (DOM is rebuilt)
  watch(currentChapterId, () => {
    termOccurrenceIndex.value = {};
  });

  return {
    // State
    terms,
    isLoading,
    error,
    isGlossaryVisible,
    isHighlightEnabled,
    showSeriesLevelTerms,
    currentSeriesId,
    currentChapterId,
    termOccurrenceIndex,
    
    // Computed
    termsByCategory,
    termsByCurrentChapter,
    termsByCategoryFlat,
    
    // Actions
    getTermsByContext,
    invalidateCache,
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
    toggleSeriesLevelTerms,
    clearError,
    scrollToTermOccurrence,
  };
});
