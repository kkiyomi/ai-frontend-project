/**
 * Chapters Module - Pinia Store
 *
 * Manages chapter state and operations including file parsing using `parseFileContent` utility,
 * content management, and chapter organization by series. Supports both file uploads and
 * direct text input for chapter creation. Features automatic paragraph parsing and
 * enriched chapter data structure with original/translated paragraph arrays.
 *
 * Usage Example:
 * ```typescript
 * import { useChaptersStore } from '@/modules/chapters';
 *
 * const chapters = useChaptersStore();
 * await chapters.loadChapters('series-id');
 *
 * // Add chapter from file (auto-parses content)
 * await chapters.addChapter(file, 'series-id');
 *
 * // Add chapter from text
 * await chapters.addChapterFromText('Content', 'Title', 'series-id');
 *
 * // Update chapter content
 * await chapters.updateChapter('chapter-id', { content: 'New content' });
 * ```
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { chapterAPI } from './api';
import type { Chapter, ChapterCreateInput, ChapterUpdateInput } from './types';
import { parseFileContent } from '@/utils/fileParser';

export const useChaptersStore = defineStore('chapters', () => {
  const chapters = ref<Chapter[]>([]);
  const currentChapterId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  let dataLoaded = false;
  let loadingPromise: Promise<void> | null = null;

  const currentChapter = computed(() =>
    chapters.value.find(chapter => chapter.id === currentChapterId.value) || null
  );

  const getChaptersBySeriesId = computed(() => {
    return (seriesId: string) => chapters.value.filter(ch => ch.seriesId === seriesId);
  });

  function buildOriginalParagraphs(content: string): string[] {
    return content.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  }

  function buildTranslatedParagraphs(translatedContent: string): string[] {
    return translatedContent.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  }

  function mergeChapters(
    current: Chapter[],
    incoming: Chapter[]
  ): Chapter[] {
    const list = [...current];
    const indexById = new Map(list.map((ch, i) => [ch.id, i]));

    for (let i = 0; i < incoming.length; i++) {
      const ch = incoming[i];

      // Update if exists
      if (indexById.has(ch.id)) {
        const idx = indexById.get(ch.id)!;
        list[idx] = ch;
        continue;
      }

      // Find insertion point using nearest known neighbor
      let insertAt = -1;

      // look backward
      for (let j = i - 1; j >= 0; j--) {
        const prev = incoming[j];
        if (indexById.has(prev.id)) {
          insertAt = indexById.get(prev.id)! + 1;
          break;
        }
      }

      // look forward
      if (insertAt === -1) {
        for (let j = i + 1; j < incoming.length; j++) {
          const next = incoming[j];
          if (indexById.has(next.id)) {
            insertAt = indexById.get(next.id)!;
            break;
          }
        }
      }

      // fallback
      if (insertAt === -1) {
        insertAt = list.length;
      }

      list.splice(insertAt, 0, ch);

      // refresh index map
      indexById.clear();
      list.forEach((c, idx) => indexById.set(c.id, idx));
    }

    return list;
  }

  async function loadChapters(seriesId?: string, chapterIds?: string[]): Promise<void> {
    if (loadingPromise) {
      return loadingPromise;
    }

    if (dataLoaded && chapters.value.length > 0 && !seriesId && !chapterIds) {
      return;
    }

    loadingPromise = performLoad(seriesId, chapterIds);
    await loadingPromise;
    loadingPromise = null;
  }

  async function performLoad(seriesId?: string, chapterIds?: string[]): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await chapterAPI.getChapters(seriesId, chapterIds);
      if (!response.success || !response.data) return;

      const enriched = response.data.map((chapter) => ({
        ...chapter,
        translatedContent: chapter.translatedContent || '',
        originalParagraphs: buildOriginalParagraphs(chapter.content),
        translatedParagraphs: buildTranslatedParagraphs(chapter.translatedContent || ''),
      }));

      chapters.value = mergeChapters(chapters.value, enriched);

      if (!seriesId && !chapterIds) {
        dataLoaded = true;
      }

    } catch (err) {
      console.error('Error loading chapters:', err);
      error.value = 'Failed to load chapters';
    } finally {
      isLoading.value = false;
    }
  }

  async function createChapter(input: ChapterCreateInput): Promise<Chapter | null> {
    try {
      const response = await chapterAPI.createChapter(input);

      if (response.success && response.data) {
        const enrichedChapter = {
          ...response.data,
          originalParagraphs: buildOriginalParagraphs(response.data.content),
          translatedParagraphs: buildTranslatedParagraphs(response.data.translatedContent || ''),
        };

        chapters.value.unshift(enrichedChapter);

        if (!currentChapterId.value) {
          currentChapterId.value = enrichedChapter.id;
        }

        return enrichedChapter;
      } else {
        error.value = response.error || 'Failed to create chapter';
        return null;
      }
    } catch (err) {
      console.error('Error creating chapter:', err);
      error.value = 'Failed to create chapter';
      return null;
    }
  }

  async function addChapter(file: File, targetSeriesId: string): Promise<void> {
    try {
      const content = await parseFileContent(file);
      const title = file.name.replace(/\.[^/.]+$/, '');
      await createChapter({ title, content, seriesId: targetSeriesId });
    } catch (err) {
      console.error('Error processing file:', err);
      throw new Error('Failed to process file');
    }
  }

  async function addChapterFromText(
    content: string,
    title: string,
    seriesId: string
  ): Promise<Chapter | null> {
    return createChapter({ title, content, seriesId });
  }

  async function updateChapter(chapterId: string, updates: ChapterUpdateInput): Promise<void> {
    try {
      const response = await chapterAPI.updateChapter(chapterId, updates);

      if (response.success && response.data) {
        console.log('Updating chapter success');
        const index = chapters.value.findIndex(ch => ch.id === chapterId);
        if (index !== -1) {
          const currentChapter = chapters.value[index];
          const enrichedChapter = {
            ...response.data,
            originalParagraphs: updates.content
              ? buildOriginalParagraphs(updates.content)
              : currentChapter.originalParagraphs,
            translatedParagraphs: updates.translatedContent
              ? buildTranslatedParagraphs(updates.translatedContent)
              : currentChapter.translatedParagraphs,
          };
          chapters.value[index] = enrichedChapter;
        }
      } else {
        error.value = response.error || 'Failed to update chapter';
      }
    } catch (err) {
      console.error('Error updating chapter:', err);
      error.value = 'Failed to update chapter';
    }
  }

  async function deleteChapter(chapterId: string): Promise<void> {
    try {
      const response = await chapterAPI.deleteChapter(chapterId);

      if (response.success) {
        chapters.value = chapters.value.filter(ch => ch.id !== chapterId);

        if (currentChapterId.value === chapterId) {
          currentChapterId.value = chapters.value.length > 0 ? chapters.value[0].id : null;
        }
      } else {
        error.value = response.error || 'Failed to delete chapter';
      }
    } catch (err) {
      console.error('Error deleting chapter:', err);
      error.value = 'Failed to delete chapter';
    }
  }

  function selectChapter(chapterId: string | null): void {
    currentChapterId.value = chapterId;
  }

  async function refresh(seriesId?: string, chapterIds?: string[]): Promise<void> {
    if (!seriesId && !chapterIds) {
      dataLoaded = false;
    }
    await loadChapters(seriesId, chapterIds);
  }

  async function forceReload(): Promise<void> {
    dataLoaded = false;
    chapters.value = [];
    await loadChapters();
  }

  function clearError() {
    error.value = null;
  }

  return {
    chapters,
    currentChapter,
    currentChapterId,
    isLoading,
    error,
    getChaptersBySeriesId,
    loadChapters,
    addChapter,
    addChapterFromText,
    selectChapter,
    createChapter,
    updateChapter,
    deleteChapter,
    refresh,
    forceReload,
    clearError,
  };
});
