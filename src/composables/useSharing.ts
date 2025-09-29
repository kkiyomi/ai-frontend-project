import { computed } from 'vue';
import { useCollaborationStore } from '../features/collaboration/store.js';

// Composable wrapper for the collaboration store
export function useSharing() {
  const collaborationStore = useCollaborationStore();

  return {
    // Expose store state and actions
    ...collaborationStore,
  };
}