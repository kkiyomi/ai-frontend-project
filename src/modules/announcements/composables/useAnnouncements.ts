import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAnnouncementsStore } from '../store';

/**
 * Composable for announcements functionality.
 *
 * Provides reactive access to announcements state and common operations.
 * Auto-fetches announcements on mount when called within a component.
 *
 * Usage Example:
 * ```typescript
 * const {
 *   announcements,
 *   loading,
 *   error,
 *   activeAnnouncements,
 *   fetchAnnouncements,
 *   dismissAnnouncement
 * } = useAnnouncements();
 * ```
 */
export function useAnnouncements(autoFetch = true) {
  const store = useAnnouncementsStore();
  const { announcements, loading, error, dismissedIds, activeAnnouncements } = storeToRefs(store);

  onMounted(() => {
    if (autoFetch) {
      store.fetchAnnouncements();
    }
  });

  return {
    // Reactive state
    announcements,
    loading,
    error,
    dismissedIds,
    activeAnnouncements,

    // Actions
    fetchAnnouncements: store.fetchAnnouncements,
    dismissAnnouncement: store.dismissAnnouncement,
    clearDismissed: store.clearDismissed,
    clearError: store.clearError,
  };
}