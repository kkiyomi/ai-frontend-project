import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSeriesStore, type Series } from '@/modules/series';
import { useChaptersStore } from '@/modules/chapters';
import type { SeriesWithChapters } from '@/types';


/**
 * Composable for combining series and chapters
 *
 * Supports:
 * - current series
 * - specific series by ID
 * - multiple series by IDs
 * - all series
 */
export function useSeriesWithChapters() {
  const seriesStore = useSeriesStore();
  const chaptersStore = useChaptersStore();

  const { selectedSeries, series } = storeToRefs(seriesStore);
  const { chapters } = storeToRefs(chaptersStore);

  /**
   * Helper — returns a series with its related chapters
   */
  const mapSeriesWithChapters = (s: Series): SeriesWithChapters => {
    return {
      ...s,
      chapters: chaptersStore.getChaptersBySeriesId(s.id)
    };
  };

  /**
   * Current series with chapters
   */
  const selectedSeriesWithChapters = computed<SeriesWithChapters | null>(() => {
    return selectedSeries.value ? mapSeriesWithChapters(selectedSeries.value) : null;
  });

  /**
   * Get series with chapters.
   * - If `seriesIds` is provided, returns the matching series.
   * - If not provided, returns all series.
   */
  const getSeriesWithChapters = (seriesIds?: string[]): SeriesWithChapters[] => {
    const filteredSeries = seriesIds
      ? series.value.filter(s => seriesIds.includes(s.id))
      : series.value;

    return filteredSeries.map(mapSeriesWithChapters);
  };


  /**
   * All series with chapters (reactive)
   */
  const allSeriesWithChapters = computed<SeriesWithChapters[]>(() => {
    return series.value.map(mapSeriesWithChapters);
  });

  return {
    // computed values
    selectedSeriesWithChapters,
    allSeriesWithChapters,

    // methods
    getSeriesWithChapters,
  };
}
