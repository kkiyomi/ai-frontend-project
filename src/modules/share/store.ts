import { defineStore } from 'pinia';
import { ref } from 'vue';
import { shareAPI } from './api';
import type { SharedChapterData, SharedSeriesData, ShareLink, CreateShareLinkRequest } from './types';

export const useShareStore = defineStore('share', () => {
  // --- Public reader state ---
  const chapterData = ref<SharedChapterData | null>(null);
  const seriesData = ref<SharedSeriesData | null>(null);

  // --- Translator publisher state ---
  const links = ref<ShareLink[]>([]);

  // --- Shared state ---
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Public reader actions ---

  async function loadSharedChapter(uuid: string) {
    loading.value = true;
    error.value = null;
    try {
      chapterData.value = await shareAPI.getSharedChapter(uuid);
      seriesData.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load shared content';
      chapterData.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function loadSharedChapterInSeries(seriesUuid: string, chapterUuid: string) {
    loading.value = true;
    error.value = null;
    try {
      chapterData.value = await shareAPI.getSharedChapterInSeries(seriesUuid, chapterUuid);
      seriesData.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load shared content';
      chapterData.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function loadSharedSeries(uuid: string) {
    loading.value = true;
    error.value = null;

    try {
      seriesData.value = await shareAPI.getSharedSeries(uuid);
      chapterData.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load shared series';
      seriesData.value = null;
    } finally {
      loading.value = false;
    }
  }

  // --- Translator publisher actions ---

  async function createShareLink(request: CreateShareLinkRequest): Promise<ShareLink | null> {
    loading.value = true;
    error.value = null;

    try {
      const response = await shareAPI.createShareLink(request);
      if (response.success && response.data) {
        links.value.unshift(response.data);
        return response.data;
      }
      error.value = response.error || 'Failed to create share link';
      return null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create share link';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchLinks() {
    loading.value = true;
    error.value = null;

    try {
      const response = await shareAPI.listShareLinks();
      if (response.success && response.data) {
        links.value = response.data;
      } else {
        error.value = response.error || 'Failed to fetch share links';
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch share links';
    } finally {
      loading.value = false;
    }
  }

  async function revokeLink(uuid: string): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const response = await shareAPI.revokeShareLink(uuid);
      if (response.success) {
        // Update local state
        const link = links.value.find((l) => l.uuid === uuid);
        if (link) link.active = false;
        return true;
      }
      error.value = response.error || 'Failed to revoke share link';
      return false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to revoke share link';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    chapterData,
    seriesData,
    links,
    loading,
    error,
    // Public reader actions
    loadSharedChapter,
    loadSharedChapterInSeries,
    loadSharedSeries,
    // Translator actions
    createShareLink,
    fetchLinks,
    revokeLink,
    // Utilities
    clearError,
  };
});
