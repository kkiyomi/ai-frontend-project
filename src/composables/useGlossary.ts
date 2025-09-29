import { computed } from 'vue';
import { useGlossaryStore } from '../features/glossary/store.js';
import { useContentStore } from '../features/content/store.js';

// Composable wrapper for the glossary store
export function useGlossary() {
  const glossaryStore = useGlossaryStore();
  const contentStore = useContentStore();
  
  // Enhanced methods that use current context
  const loadGlossaryTerms = () => {
    const seriesId = contentStore.currentSeriesId;
    const chapterId = contentStore.currentChapterId;
    return glossaryStore.loadGlossaryTerms(seriesId, chapterId);
  };
  
  const addTerm = (term) => {
    const seriesId = contentStore.currentSeriesId;
    const chapterId = contentStore.currentChapterId;
    return glossaryStore.addTerm(term, seriesId, chapterId);
  };
  
  const termExistsInSeries = (termText) => {
    const seriesId = contentStore.currentSeriesId;
    return glossaryStore.termExistsInSeries(termText, seriesId);
  };

  return {
    // Expose store state and actions
    ...glossaryStore,
    // Enhanced methods with context
    loadGlossaryTerms,
    addTerm,
    termExistsInSeries,
  };
}