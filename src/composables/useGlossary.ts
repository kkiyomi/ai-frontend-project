import { ref, computed } from 'vue';
import type { GlossaryTerm } from '../types';

const glossaryTerms = ref<GlossaryTerm[]>([]);
const isGlossaryVisible = ref(false);

export function useGlossary() {
  const addTerm = (term: Omit<GlossaryTerm, 'id' | 'frequency'>): void => {
    const newTerm: GlossaryTerm = {
      ...term,
      id: `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      frequency: 1,
    };
    
    glossaryTerms.value.push(newTerm);
  };

  const updateTerm = (termId: string, updates: Partial<GlossaryTerm>): void => {
    const index = glossaryTerms.value.findIndex(term => term.id === termId);
    if (index !== -1) {
      glossaryTerms.value[index] = { ...glossaryTerms.value[index], ...updates };
    }
  };

  const removeTerm = (termId: string): void => {
    glossaryTerms.value = glossaryTerms.value.filter(term => term.id !== termId);
  };

  const findTermByText = (text: string): GlossaryTerm | undefined => {
    return glossaryTerms.value.find(term => 
      term.term.toLowerCase() === text.toLowerCase()
    );
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
    termsByCategory,
    addTerm,
    updateTerm,
    removeTerm,
    findTermByText,
    suggestTermsFromText,
    highlightTermsInText,
    toggleGlossaryVisibility,
  };
}