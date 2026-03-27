import type { Router } from 'vue-router';
import { useSeriesStore } from '@/modules/series';
import { useChaptersStore } from '@/modules/chapters';

/**
 * Set up route guards for series and chapters navigation
 * Syncs route parameters with store selections
 */
export function setupRouteGuards(router: Router): void {
  router.beforeEach(async (to, from, next) => {
    const seriesStore = useSeriesStore();
    const chaptersStore = useChaptersStore();
    
    const seriesId = to.params.seriesId as string | undefined;
    const chapterId = to.params.chapterId as string | undefined;

    // Reset selections if no series in route
    if (!seriesId) {
      seriesStore.selectSeries(null);
      chaptersStore.selectChapter(null);
      next();
      return;
    }

    // Ensure series exists in store
    let series = seriesStore.series.find(s => s.id === seriesId);
    if (!series) {
      // Try to fetch series if not in store
      const fetchedSeries = await seriesStore.fetchSeriesById(seriesId);
      if (!fetchedSeries) {
        // Series not found, redirect to home
        next('/');
        return;
      }
    }
    seriesStore.selectSeries(seriesId);
    
    // Ensure all chapters are loaded (sidebar needs full list)
    await chaptersStore.loadChapters();
    
    if (chapterId) {
      // Ensure chapter exists in store
      let chapter = chaptersStore.chapters.find(c => c.id === chapterId);
      if (!chapter) {
        // Chapter not found, try to load specifically for this series
        await chaptersStore.loadChapters(seriesId);
        chapter = chaptersStore.chapters.find(c => c.id === chapterId);
        if (!chapter) {
          // Chapter not found, redirect to series detail
          next(`/series/${seriesId}`);
          return;
        }
      }
      chaptersStore.selectChapter(chapterId);
    } else {
      chaptersStore.selectChapter(null);
    }

    next();
  });
}