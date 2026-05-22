/**
 * useChapterNavigation — Composable for prev/next chapter navigation
 *
 * Derives previous and next chapter IDs from the current series' `chapterIds` array,
 * which is the source of truth for chapter ordering.
 *
 * Usage:
 * ```ts
 * const { prevChapterId, nextChapterId } = useChapterNavigation();
 * ```
 */
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSeriesStore } from '@/modules/series';
import { useChaptersStore } from '@/modules/chapters';

export function useChapterNavigation() {
  const seriesStore = useSeriesStore();
  const chaptersStore = useChaptersStore();

  const { selectedSeries } = storeToRefs(seriesStore);
  const { currentChapterId } = storeToRefs(chaptersStore);

  /** Ordered chapter IDs from the current series' chapterIds array */
  const orderedChapterIds = computed(() => {
    return selectedSeries.value?.chapterIds ?? [];
  });

  /** Index of the current chapter in the ordered list */
  const currentChapterIndex = computed(() => {
    if (!currentChapterId.value) return -1;
    return orderedChapterIds.value.indexOf(currentChapterId.value);
  });

  /** Previous chapter ID, or null if at start */
  const prevChapterId = computed<string | null>(() => {
    const idx = currentChapterIndex.value;
    if (idx <= 0) return null;
    return orderedChapterIds.value[idx - 1] ?? null;
  });

  /** Next chapter ID, or null if at end */
  const nextChapterId = computed<string | null>(() => {
    const idx = currentChapterIndex.value;
    if (idx < 0 || idx >= orderedChapterIds.value.length - 1) return null;
    return orderedChapterIds.value[idx + 1] ?? null;
  });

  return {
    orderedChapterIds,
    currentChapterIndex,
    prevChapterId,
    nextChapterId,
  };
}
