import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SharedContent, ShareStats } from './types';

/**
 * Sharing Store - Pinia Store
 *
 * Manages sharing state and operations with localStorage persistence for recent shares.
 * Features include: share creation statistics, expiration tracking, and automatic
 * persistence of up to 10 recent shares. Provides comprehensive share statistics
 * calculation including translation progress metrics.
 *
 * Usage Example:
 * ```typescript
 * import { useSharingStore } from '@/modules/sharing';
 *
 * const sharing = useSharingStore();
 *
 * // Create a share
 * await sharing.setActiveShare(shareData);
 *
 * // Get share statistics for selected content
 * const stats = sharing.getShareStats(chapters, ['ch1'], ['s1']);
 *
 * // Access persisted recent shares
 * console.log(sharing.recentShares);
 * ```
 */
export const useSharingStore = defineStore('sharing', () => {
  // State
  const recentShares = ref<SharedContent[]>([]);
  const activeShare = ref<SharedContent | null>(null);
  const isCreatingShare = ref(false);
  const isLoadingShare = ref(false);
  const shareError = ref<string | null>(null);

  // Computed
  const hasRecentShares = computed(() => recentShares.value.length > 0);

  const validShares = computed(() => {
    const now = new Date();
    return recentShares.value.filter(share => {
      if (!share.expiresAt) return true;
      return new Date(share.expiresAt) > now;
    });
  });

  // Actions
  function setActiveShare(share: SharedContent | null) {
    activeShare.value = share;
  }

  function addRecentShare(share: SharedContent) {
    const exists = recentShares.value.find(s => s.id === share.id);
    if (!exists) {
      recentShares.value.unshift(share);
      // Keep only last 10 shares
      if (recentShares.value.length > 10) {
        recentShares.value = recentShares.value.slice(0, 10);
      }
      saveToLocalStorage();
    }
  }

  function removeShare(shareId: string) {
    recentShares.value = recentShares.value.filter(s => s.id !== shareId);
    if (activeShare.value?.id === shareId) {
      activeShare.value = null;
    }
    saveToLocalStorage();
  }

  function clearRecentShares() {
    recentShares.value = [];
    saveToLocalStorage();
  }

  function setCreatingShare(value: boolean) {
    isCreatingShare.value = value;
  }

  function setLoadingShare(value: boolean) {
    isLoadingShare.value = value;
  }

  function setShareError(error: string | null) {
    shareError.value = error;
  }

  function getShareStats(
    chapters: Array<{ id: string; seriesId: string; originalParagraphs?: string[]; translatedParagraphs?: string[] }>,
    selectedChapterIds: string[],
    selectedSeriesIds: string[]
  ): ShareStats | null {
    if (selectedChapterIds.length === 0 && selectedSeriesIds.length === 0) {
      return null;
    }

    // Filter chapters based on selection
    const selectedChapters = chapters.filter(c => {
      return selectedChapterIds.includes(c.id) || selectedSeriesIds.includes(c.seriesId);
    });

    const totalParagraphs = selectedChapters.reduce(
      (sum, c) => sum + (c.originalParagraphs?.length || 0),
      0
    );

    const translatedParagraphs = selectedChapters.reduce(
      (sum, c) => sum + (c.translatedParagraphs?.filter((p: string) => p.trim()).length || 0),
      0
    );

    const uniqueSeriesIds = new Set(selectedChapters.map(c => c.seriesId));

    return {
      totalChapters: selectedChapters.length,
      totalSeries: uniqueSeriesIds.size,
      totalParagraphs,
      translatedParagraphs,
      translationProgress: totalParagraphs > 0
        ? Math.round((translatedParagraphs / totalParagraphs) * 100)
        : 0,
    };
  }

  // Persistence
  function saveToLocalStorage() {
    try {
      localStorage.setItem('recent-shares', JSON.stringify(recentShares.value));
    } catch (error) {
      console.error('Failed to save shares to localStorage:', error);
    }
  }

  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('recent-shares');
      if (stored) {
        recentShares.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load shares from localStorage:', error);
      recentShares.value = [];
    }
  }

  // Initialize
  loadFromLocalStorage();

  return {
    // State
    recentShares,
    activeShare,
    isCreatingShare,
    isLoadingShare,
    shareError,

    // Computed
    hasRecentShares,
    validShares,

    // Actions
    setActiveShare,
    addRecentShare,
    removeShare,
    clearRecentShares,
    setCreatingShare,
    setLoadingShare,
    setShareError,
    getShareStats,
    loadFromLocalStorage,
    clearError: () => {
      shareError.value = null;
    },
  };
});
