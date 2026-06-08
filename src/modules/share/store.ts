import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { shareAPI } from './api';
import { getSharedSession } from '@/modules/core';
import type { SharedChapterData, SharedSeriesData, ShareLink, CreateShareLinkRequest } from './types';

export const useShareStore = defineStore('share', () => {
  // --- Public reader state ---
  const chapterData = ref<SharedChapterData | null>(null);
  const seriesData = ref<SharedSeriesData | null>(null);

  // --- Translator publisher state ---
  const links = ref<ShareLink[]>([]);
  const linksLoaded = ref(false);

  // --- Shared state ---
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Ownership detection ---
  const isOwner = ref(false);
  const currentLink = ref<ShareLink | null>(null);

  async function checkOwnership(uuid: string) {
    const session = getSharedSession();
    if (!session.isLoggedIn.value) return;

    if (!linksLoaded.value) {
      try {
        const resp = await shareAPI.listShareLinks();
        if (resp.success && resp.data) {
          links.value = resp.data;
        }
      } catch {
        // Silently ignore - user may not be logged in
      }
      linksLoaded.value = true;
    }

    const found = links.value.find(
      (l) => l.uuid === uuid || l.customName === uuid,
    );
    isOwner.value = !!found;
    currentLink.value = found || null;
  }

  // --- Public reader actions ---

  async function loadSharedChapter(uuid: string) {
    loading.value = true;
    error.value = null;
    try {
      chapterData.value = await shareAPI.getSharedChapter(uuid);
      seriesData.value = null;
      await checkOwnership(uuid);
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
      const [chapter, series] = await Promise.all([
        shareAPI.getSharedChapterInSeries(seriesUuid, chapterUuid),
        shareAPI.getSharedSeries(seriesUuid),
      ]);
      chapterData.value = chapter;
      seriesData.value = series;
      await checkOwnership(seriesUuid);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load shared content';
      chapterData.value = null;
      seriesData.value = null;
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
      await checkOwnership(uuid);
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
        linksLoaded.value = true;
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

  async function toggleChapterPublish(chapterUuid: string, publish: boolean) {
    try {
      const resp = await shareAPI.toggleChapterPublished(chapterUuid, publish);
      if (resp.success && resp.data) {
        const newState = resp.data.is_published;
        // Update chapter view data
        if (chapterData.value) {
          chapterData.value = { ...chapterData.value, isPublished: newState };
        }
        // Update the chapter in seriesData (ToC)
        if (seriesData.value) {
          const idx = seriesData.value.chapters.findIndex((c) => c.uuid === chapterUuid);
          if (idx >= 0) {
            const updated = [...seriesData.value.chapters];
            updated[idx] = { ...updated[idx], isPublished: newState };
            seriesData.value = { ...seriesData.value, chapters: updated };
          }
        }
      }
    } catch {
      // Silently handle
    }
  }

  async function toggleChaptersPublish(uuids: string[], publish: boolean) {
    const resp = await shareAPI.batchToggleChaptersPublished(uuids, publish);
    if (resp.success && resp.data && seriesData.value) {
      const uuidSet = new Set(uuids);
      const updated = seriesData.value.chapters.map((c) =>
        uuidSet.has(c.uuid) ? { ...c, isPublished: publish } : c,
      );
      seriesData.value = { ...seriesData.value, chapters: updated };
    }
    return resp;
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
    isOwner,
    currentLink,
    // Public reader actions
    loadSharedChapter,
    loadSharedChapterInSeries,
    loadSharedSeries,
    // Translator actions
    createShareLink,
    fetchLinks,
    revokeLink,
    toggleChapterPublish,
    toggleChaptersPublish,
    // Utilities
    clearError,
  };
});
