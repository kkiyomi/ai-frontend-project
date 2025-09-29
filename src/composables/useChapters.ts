import { computed } from 'vue';
import { useContentStore } from '../features/content/store.js';

// Composable wrapper for the content store
export function useChapters() {
  const contentStore = useContentStore();
  
  // Initialize data loading
  contentStore.loadSeries();
  
  return {
    // Expose store state and actions
    ...contentStore,
  };
}