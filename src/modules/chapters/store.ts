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

  async function loadChapters(seriesId?: string): Promise<void> {
    if (loadingPromise) {
      return loadingPromise;
    }

    if (dataLoaded && chapters.value.length > 0 && !seriesId) {
      return;
    }

    loadingPromise = performLoad(seriesId);
    await loadingPromise;
    loadingPromise = null;
  }

  async function performLoad(seriesId?: string): Promise<void> {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await chapterAPI.getChapters(seriesId);

      if (response.success && response.data) {
        const enrichedChapters = response.data.map((chapter) => ({
          ...chapter,
          translatedContent: chapter.translatedContent || '',
          originalParagraphs: buildOriginalParagraphs(chapter.content),
          translatedParagraphs: buildTranslatedParagraphs(chapter.translatedContent || ''),
        }));

        if (seriesId) {
          chapters.value = [
            ...chapters.value.filter(ch => ch.seriesId !== seriesId),
            ...enrichedChapters
          ];
        } else {
          chapters.value = enrichedChapters;
          dataLoaded = true;
        }

        if (enrichedChapters.length > 0 && !currentChapterId.value) {
          currentChapterId.value = enrichedChapters[0].id;
        }
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

        chapters.value.push(enrichedChapter);

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

  function selectChapter(chapterId: string): void {
    currentChapterId.value = chapterId;
  }

  function removeChapter(chapterId: string): void {
    chapters.value = chapters.value.filter(ch => ch.id !== chapterId);

    if (currentChapterId.value === chapterId) {
      currentChapterId.value = chapters.value.length > 0 ? chapters.value[0].id : null;
    }
  }

  async function refresh(seriesId?: string): Promise<void> {
    if (!seriesId) {
      dataLoaded = false;
    }
    await loadChapters(seriesId);
  }

  async function forceReload(): Promise<void> {
    dataLoaded = false;
    chapters.value = [];
    await loadChapters();
  }

  return {
    chapters: computed(() => chapters.value),
    currentChapter,
    currentChapterId,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    getChaptersBySeriesId,
    loadChapters,
    createChapter,
    addChapter,
    addChapterFromText,
    updateChapter,
    deleteChapter,
    selectChapter,
    removeChapter,
    refresh,
    forceReload,
  };
});
