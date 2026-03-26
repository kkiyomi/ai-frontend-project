import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { announcementsAPI } from './api';
import type { Announcement, AnnouncementsState } from './types';

/**
 * Announcements Module - Pinia Store
 *
 * Manages announcements state and operations including fetching announcements,
 * dismissing announcements, and filtering active announcements.
 *
 * Usage Example:
 * ```typescript
 * import { useAnnouncementsStore } from '@/modules/announcements';
 *
 * const announcements = useAnnouncementsStore();
 * await announcements.fetchAnnouncements();
 *
 * // Dismiss an announcement
 * announcements.dismissAnnouncement('ann-1');
 *
 * // Access active announcements
 * console.log(announcements.activeAnnouncements);
 * ```
 */

export const useAnnouncementsStore = defineStore('announcements', () => {
  const announcements = ref<Announcement[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const dismissedIds = ref<string[]>([]);

  const activeAnnouncements = computed(() => {
    return announcements.value.filter(
      announcement => announcement.isActive && !dismissedIds.value.includes(announcement.id)
    );
  });

  async function fetchAnnouncements() {
    loading.value = true;
    error.value = null;

    try {
      const response = await announcementsAPI.getAnnouncements();

      if (response.success && response.data) {
        announcements.value = response.data;
      } else {
        error.value = response.error || 'Failed to fetch announcements';
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  }

  function dismissAnnouncement(announcementId: string) {
    if (!dismissedIds.value.includes(announcementId)) {
      dismissedIds.value.push(announcementId);
    }
  }

  function clearDismissed() {
    dismissedIds.value = [];
  }

  function clearError() {
    error.value = null;
  }

  return {
    announcements,
    loading,
    error,
    dismissedIds,
    activeAnnouncements,
    fetchAnnouncements,
    dismissAnnouncement,
    clearDismissed,
    clearError
  };
});