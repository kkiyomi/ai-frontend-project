// Glossary domain store - manages glossary terms, categories, definitions
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '../../shared/services/apiService.js';

export const useGlossaryStore = defineStore('glossary', () => {
  // State
  const glossaryTerms = ref([]);
  const isGlossaryVisible = ref(false);
  const isHighlightEnabled = ref(false);
  const isLoading = ref(false);

  // Cache for glossary terms
  const glossaryCache = new Map();
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
  const pendingGlossaryRequests = new Map();

  // Getters
  const termsByCategory = computed(() => {
    const grouped = {};
    glossaryTerms.value.forEach(term => {
      if (!grouped[term.category]) {
        grouped[term.category] = [];
      }
      grouped[term.category].push(term);
    });
    return grouped;
  });

  // Helper functions
  const createGlossaryCacheKey = (seriesId, chapterId) => {
    return `${seriesId || 'none'}:${chapterId || 'none'}`;
  };

  const getCachedTerms = (key) => {
    const cached = glossaryCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.terms;
    }
    glossaryCache.delete(key);
    return null;
  };

  const setCachedTerms = (key, terms) => {
    glossaryCache.set(key, { terms: [...terms], timestamp: Date.now() });
  };

  // Actions
  const loadGlossaryTerms = async (seriesId, chapterId) => {
    if (!seriesId) {
      glossaryTerms.value = [];
      return;
    }

    const cacheKey = createGlossaryCacheKey(seriesId, chapterId);

    const cachedTerms = getCachedTerms(cacheKey);
    if (cachedTerms) {
      glossaryTerms.value = cachedTerms;
      return;
    }

    if (pendingGlossaryRequests.has(cacheKey)) {
      await pendingGlossaryRequests.get(cacheKey);
      return;
    }

    const loadingPromise = performGlossaryLoad(seriesId, chapterId, cacheKey);
    pendingGlossaryRequests.set(cacheKey, loadingPromise);

    try {
      await loadingPromise;
    } finally {
      pendingGlossaryRequests.delete(cacheKey);
    }
  };

  const performGlossaryLoad = async (seriesId, chapterId, cacheKey) => {
    isLoading.value = true;
    try {
      const response = await apiService.getGlossaryTerms(seriesId);
      if (response.success && response.data) {
        let filteredTerms;
        if (chapterId) {
          filteredTerms = response.data.filter(term => 
            !term.chapterId || term.chapterId === chapterId
          );
        } else {
          filteredTerms = response.data;
        }
        
        glossaryTerms.value = filteredTerms;
        
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

  const addTerm = async (term, seriesId, chapterId) => {
    if (!seriesId) {
      console.error('No current series selected');
      return;
    }

    const termWithContext = {
      ...term,
      seriesId,
      chapterId,
    };

    try {
      const response = await apiService.createGlossaryTerm(termWithContext);
      if (response.success && response.data) {
        glossaryTerms.value.push(response.data);
        glossaryCache.clear();
      } else {
        console.error('Failed to create glossary term:', response.error);
      }
    } catch (error) {
      console.error('Error creating glossary term:', error);
    }
  };

  const updateTerm = async (termId, updates) => {
    try {
      const response = await apiService.updateGlossaryTerm(termId, updates);
      if (response.success && response.data) {
        const index = glossaryTerms.value.findIndex(term => term.id === termId);
        if (index !== -1) {
          glossaryTerms.value[index] = response.data;
        }
        glossaryCache.clear();
      } else {
        console.error('Failed to update glossary term:', response.error);
      }
    } catch (error) {
      console.error('Error updating glossary term:', error);
    }
  };

  const removeTerm = async (termId) => {
    try {
      const response = await apiService.deleteGlossaryTerm(termId);
      if (response.success) {
        glossaryTerms.value = glossaryTerms.value.filter(term => term.id !== termId);
        glossaryCache.clear();
      } else {
        console.error('Failed to delete glossary term:', response.error);
      }
    } catch (error) {
      console.error('Error deleting glossary term:', error);
    }
  };

  const findTermByText = (text) => {
    return glossaryTerms.value.find(term => 
      term.term.toLowerCase() === text.toLowerCase()
    );
  };

  const getSeriesTerms = async (seriesId) => {
    if (!seriesId) return [];
    
    try {
      const response = await apiService.getGlossaryTerms(seriesId);
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Error loading series terms:', error);
      return [];
    }
  };

  const termExistsInSeries = async (termText, seriesId) => {
    const seriesTerms = await getSeriesTerms(seriesId);
    return seriesTerms.some(term => term.term.toLowerCase() === termText.toLowerCase());
  };

  const suggestTermsFromText = (text) => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const frequency = {};
    
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
  };

  const highlightTermsInText = (text) => {
    let highlightedText = text;
    const sortedTerms = glossaryTerms.value
      .slice()
      .sort((a, b) => Math.max(b.term.length, b.translation.length) - Math.max(a.term.length, a.translation.length));

    sortedTerms.forEach(term => {
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
  };

  const toggleGlossaryVisibility = () => {
    isGlossaryVisible.value = !isGlossaryVisible.value;
  };

  const toggleHighlight = () => {
    isHighlightEnabled.value = !isHighlightEnabled.value;
  };

  const clearGlossaryCache = () => {
    glossaryCache.clear();
    pendingGlossaryRequests.clear();
  };

  return {
    // State
    glossaryTerms: computed(() => glossaryTerms.value),
    isGlossaryVisible: computed(() => isGlossaryVisible.value),
    isHighlightEnabled: computed(() => isHighlightEnabled.value),
    isLoading: computed(() => isLoading.value),
    termsByCategory,
    
    // Actions
    loadGlossaryTerms,
    addTerm,
    updateTerm,
    removeTerm,
    findTermByText,
    getSeriesTerms,
    termExistsInSeries,
    suggestTermsFromText,
    highlightTermsInText,
    toggleGlossaryVisibility,
    toggleHighlight,
    clearGlossaryCache,
  };
});

export default useGlossaryStore;