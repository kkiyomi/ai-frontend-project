import { ref, computed } from 'vue';
import type { GlossaryTerm } from '../types';
import { useAPI } from './useAPI';
import { useChapters } from './useChapters';

const glossaryTerms = ref<GlossaryTerm[]>([]);
const isGlossaryVisible = ref(false);
const isHighlightEnabled = ref(false);
const isLoading = ref(false);

// Cache for glossary terms to avoid redundant loads
const glossaryCache = new Map<string, { terms: GlossaryTerm[]; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Pending requests to avoid duplicate calls
const pendingGlossaryRequests = new Map<string, Promise<void>>();

export function useGlossary() {
  const { getGlossaryTerms, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm } = useAPI();
  const { currentChapter, currentSeries } = useChapters();

  // Helper to create cache key
  const createGlossaryCacheKey = (seriesId?: string, chapterId?: string): string => {
    return `${seriesId || 'none'}:${chapterId || 'none'}`;
  };

  // Helper to get cached terms
  const getCachedTerms = (key: string): GlossaryTerm[] | null => {
    const cached = glossaryCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.terms;
    }
    glossaryCache.delete(key);
    return null;
  };

  // Helper to cache terms
  const setCachedTerms = (key: string, terms: GlossaryTerm[]): void => {
    glossaryCache.set(key, { terms: [...terms], timestamp: Date.now() });
  };

  // Load glossary terms for current chapter
  const loadGlossaryTerms = async (): Promise<void> => {
    if (!currentSeries.value) {
      glossaryTerms.value = [];
      return;
    }

    const seriesId = currentSeries.value.id;
    const chapterId = currentChapter.value?.id;
    const cacheKey = createGlossaryCacheKey(seriesId, chapterId);

    // Check cache first
    const cachedTerms = getCachedTerms(cacheKey);
    if (cachedTerms) {
      glossaryTerms.value = cachedTerms;
      return;
    }

    // Check if request is already pending
    if (pendingGlossaryRequests.has(cacheKey)) {
      await pendingGlossaryRequests.get(cacheKey);
      return;
    }

    // Create loading promise
    const loadingPromise = performGlossaryLoad(seriesId, chapterId, cacheKey);
    pendingGlossaryRequests.set(cacheKey, loadingPromise);

    try {
      await loadingPromise;
    } finally {
      pendingGlossaryRequests.delete(cacheKey);
    }
  };

  const performGlossaryLoad = async (seriesId: string, chapterId?: string, cacheKey?: string): Promise<void> => {
    isLoading.value = true;
    try {
      // Always load all series terms, then filter on the frontend for better UX
      const response = await getGlossaryTerms(seriesId);
      if (response.success && response.data) {
        // Filter to show:
        // 1. If chapter is selected: series-level terms + chapter-specific terms
        // 2. If no chapter selected: ALL terms for the series
        let filteredTerms: GlossaryTerm[];
        if (chapterId) {
          // Show series-level terms + current chapter terms
          filteredTerms = response.data.filter(term => 
            !term.chapterId || term.chapterId === chapterId
          );
        } else {
          // If no chapter selected, show ALL terms for the series
          filteredTerms = response.data;
        }
        
        glossaryTerms.value = filteredTerms;
        
        // Cache the results
        if (cacheKey) {
          setCachedTerms(cacheKey, filteredTerms);
        }
      }
    } catch (error) {
      console.error('Error loading glossary terms:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const addTerm = async (term: Omit<GlossaryTerm, 'id' | 'frequency' | 'seriesId' | 'chapterId'>): Promise<void> => {
    if (!currentSeries.value) {
      console.error('No current series selected');
      return;
    }

    const termWithContext: Omit<GlossaryTerm, 'id' | 'frequency'> = {
      ...term,
      seriesId: currentSeries.value.id,
      chapterId: currentChapter.value?.id, // Optional - can be undefined for series-level terms
    };

    try {
      const response = await createGlossaryTerm(termWithContext);
      if (response.success && response.data) {
        glossaryTerms.value.push(response.data);
        
        // Clear cache to force reload
        glossaryCache.clear();
      } else {
        console.error('Failed to create glossary term:', response.error);
      }
    } catch (error) {
      console.error('Error creating glossary term:', error);
    }
  };

  const updateTerm = async (termId: string, updates: Partial<GlossaryTerm>): Promise<void> => {
    try {
      const response = await updateGlossaryTerm(termId, updates);
      if (response.success && response.data) {
        const index = glossaryTerms.value.findIndex(term => term.id === termId);
        if (index !== -1) {
          glossaryTerms.value[index] = response.data;
        }
        
        // Clear cache to force reload
        glossaryCache.clear();
      } else {
        console.error('Failed to update glossary term:', response.error);
      }
    } catch (error) {
      console.error('Error updating glossary term:', error);
    }
  };

  const removeTerm = async (termId: string): Promise<void> => {
    try {
      const response = await deleteGlossaryTerm(termId);
      if (response.success) {
        glossaryTerms.value = glossaryTerms.value.filter(term => term.id !== termId);
        
        // Clear cache to force reload
        glossaryCache.clear();
      } else {
        console.error('Failed to delete glossary term:', response.error);
      }
    } catch (error) {
      console.error('Error deleting glossary term:', error);
    }
  };

  const findTermByText = (text: string): GlossaryTerm | undefined => {
    return glossaryTerms.value.find(term => 
      term.term.toLowerCase() === text.toLowerCase()
    );
  };

  // Get all unique terms in the current series (for preventing duplicates)
  const getSeriesTerms = async (): Promise<GlossaryTerm[]> => {
    if (!currentSeries.value) return [];
    
    try {
      const response = await getGlossaryTerms(currentSeries.value.id);
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Error loading series terms:', error);
      return [];
    }
  };

  // Check if a term already exists in the current series
  const termExistsInSeries = async (termText: string): Promise<boolean> => {
    const seriesTerms = await getSeriesTerms();
    return seriesTerms.some(term => term.term.toLowerCase() === termText.toLowerCase());
  };

  const suggestTermsFromText = (text: string): string[] => {
    // Simple frequency analysis - in real app this would be more sophisticated
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const frequency: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Only suggest longer words
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .filter(([_, count]) => count >= 3) // Appears at least 3 times
      .sort(([_, a], [__, b]) => b - a) // Sort by frequency
      .slice(0, 10) // Top 10 suggestions
      .map(([word, _]) => word);
  };

  const highlightTermsInText = (text: string): string => {
    let highlightedText = text;
    loadGlossaryTerms()
    glossaryTerms.value.forEach(term => {
      const regex = new RegExp(term.term, 'gi');
      highlightedText = highlightedText.replace(regex,
        `<span class="glossary-highlight" data-term-id="${term.id}">$&</span>`
      );
    });
    
    return highlightedText;
  };

  const toggleGlossaryVisibility = (): void => {
    isGlossaryVisible.value = !isGlossaryVisible.value;
  };

  const toggleHighlight = (): void => {
    isHighlightEnabled.value = !isHighlightEnabled.value;
  };
  // Clear glossary cache
  const clearGlossaryCache = (): void => {
    glossaryCache.clear();
    pendingGlossaryRequests.clear();
  };
  const termsByCategory = computed(() => {
    const grouped: Record<string, GlossaryTerm[]> = {};
    glossaryTerms.value.forEach(term => {
      if (!grouped[term.category]) {
        grouped[term.category] = [];
      }
      grouped[term.category].push(term);
    });
    return grouped;
  });

  return {
    glossaryTerms: computed(() => glossaryTerms.value),
    isGlossaryVisible: computed(() => isGlossaryVisible.value),
    isHighlightEnabled: computed(() => isHighlightEnabled.value),
    isLoading: computed(() => isLoading.value),
    termsByCategory,
    loadGlossaryTerms,
    addTerm,
    updateTerm,
    removeTerm,
    findTermByText,
    getSeriesTerms,
    termExistsInSeries,
    suggestTermsFromText,
    highlightTermsInText,
    highlightGlossaryTermsInText,
    toggleGlossaryVisibility,
    toggleHighlight,
    clearGlossaryCache,
  };
}