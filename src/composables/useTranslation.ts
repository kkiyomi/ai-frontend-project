import { computed } from 'vue';
import { useTranslationStore } from '../features/translation/store.js';

// Composable wrapper for the translation store
export function useTranslation() {
  const translationStore = useTranslationStore();
  
  return {
    // Expose store state and actions
    ...translationStore,
  };
}