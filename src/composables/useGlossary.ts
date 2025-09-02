import { ref, computed } from 'vue';
import type { GlossaryTerm } from '../types';
import { useAPI } from './useAPI';
import { useChapters } from './useChapters';

const glossaryTerms = ref<GlossaryTerm[]>([]);
const isGlossaryVisible = ref(false);
const isLoading = ref(false);

export function useGlossary() {
  const { getGlossaryTerms, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm } = useAPI();
  const { currentChapter, currentSeries } = useChapters();

  // Load glossary terms for current chapter
  const loadGlossaryTerms = async (): Promise<void> => {
    if (!currentChapter.value) {
      glossaryTerms.value = [];
      return;
    }

    isLoading.value = true;
    try {
      const response = await getGlossaryTerms(currentChapter.value.seriesId, currentChapter.value.id);
      if (response.success && response.data) {
        glossaryTerms.value = response.data;
      }
    } catch (error) {
      console.error('Error loading glossary terms:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const addTerm = async (term: Omit<GlossaryTerm, 'id' | 'frequency' | 'seriesId' | 'chapterId'>): Promise<void> => {
    if (!currentChapter.value || !currentSeries.value) {
      console.error('No current chapter or series selected');
      return;
    }

    const termWithContext: Omit<GlossaryTerm, 'id' | 'frequency'> = {
      ...term,
      seriesId: currentSeries.value.id,
      chapterId: currentChapter.value.id,
    };

    try {
      const response = await createGlossaryTerm(termWithContext);
      if (response.success && response.data) {
        glossaryTerms.value.push(response.data);
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
    
    glossaryTerms.value.forEach(term => {
      const regex = new RegExp(`\\b${term.term}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, 
        `<span class="glossary-highlight" data-term-id="${term.id}">$&</span>`
      );
    });
    
    return highlightedText;
  };

  const toggleGlossaryVisibility = (): void => {
    isGlossaryVisible.value = !isGlossaryVisible.value;
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
    toggleGlossaryVisibility,
  };
}