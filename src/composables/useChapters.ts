import { ref, computed, onMounted } from 'vue';
import type { Chapter, Series } from '../types';
import { parseFileContent } from '../utils/fileParser';
import { useDataAPI } from './useAPI';

const series = ref<Series[]>([]);
const currentChapterId = ref<string | null>(null);
const currentSeriesId = ref<string | null>(null);
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);

// Cache for loaded data to avoid redundant API calls
let dataLoaded = false;
let loadingPromise: Promise<void> | null = null;

export function useChapters() {
  const { getSeries, getChapters, createSeries: createSeriesAPI, updateSeries: updateSeriesAPI, deleteSeries: deleteSeriesAPI, updateChapter: updateChapterAPI } = useDataAPI();

  const chapters = computed(() => 
    series.value.flatMap(s => s.chapters)
  );

  const currentChapter = computed(() => 
    chapters.value.find(chapter => chapter.id === currentChapterId.value)
  );

  const currentSeries = computed(() =>
    series.value.find(s => s.id === currentSeriesId.value)
  );

  function buildParagraphs(content: string, chapterId: string) {
      return content
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map((text, index) => ({
          id: `${chapterId}-p${index}`,
          originalText: text,
          translatedText: '',
          isEditing: false,
          chapterId,
        }));
    }

  function buildChapterFromContent(content: string, translatedContent: string, chapterId: string) {
    const originalParagraphs = content.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    const translatedParagraphs = translatedContent.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    
    return originalParagraphs.map((text, index) => ({
      id: `${chapterId}-p${index}`,
      originalText: text,
      translatedText: translatedParagraphs[index] || '',
      isEditing: false,
      chapterId,
    }));
  }

  // Load series and chapters from API
  const loadSeriesFromAPI = async (): Promise<void> => {
    // Avoid multiple simultaneous loads
    if (loadingPromise) {
      return loadingPromise;
    }
    
    // Return early if data is already loaded
    if (dataLoaded && series.value.length > 0) {
      return;
    }

    loadingPromise = performLoad();
    await loadingPromise;
    loadingPromise = null;
  };

  const performLoad = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Fetch series data
      const seriesResponse = await getSeries();
      if (seriesResponse.success && seriesResponse.data) {
        const seriesData = seriesResponse.data;
        
//         // Load chapters for all series in parallel for better performance
//         const chapterPromises = seriesData.map(async (seriesItem) => {
//           const chaptersResponse = await getChapters(seriesItem.id);
//           if (chaptersResponse.success && chaptersResponse.data) {
//             const enrichedChapters = chaptersResponse.data.map((chapter: any) => ({
//               ...chapter,
//               translatedContent: chapter.translatedContent || '',
//               paragraphs: buildChapterFromContent(chapter.content, chapter.translatedContent || '', chapter.id),
//             }));
//             seriesItem.chapters = enrichedChapters;
//           } else {
//             seriesItem.chapters = [];
//           }
//           return seriesItem;
//         });
//
//         // Wait for all chapter loading to complete
//         const loadedSeries = await Promise.all(chapterPromises);

        async function loadChaptersForSeries(seriesData: any[]) {
          const ids = seriesData.map(s => s.id).join(",");

          const { success, data } = await getChapters(ids);
          if (!success || !data) {
            return seriesData.map(s => ({ ...s, chapters: [] }));
          }

          return seriesData.map(seriesItem => ({
            ...seriesItem,
            chapters: (data.filter((c: any) => c.seriesId === seriesItem.id) || [])
              .map((chapter: any) => ({
                ...chapter,
                translatedContent: chapter.translatedContent || '',
                paragraphs: buildChapterFromContent(chapter.content, chapter.translatedContent || '', chapter.id),
              })),
          }));
        }
        const loadedSeries = await loadChaptersForSeries(seriesData)
        series.value = loadedSeries;
        dataLoaded = true;

        // Set current series and chapter if data exists
        if (series.value.length > 0) {
          currentSeriesId.value = series.value[0].id;
          
          const firstSeries = series.value[0];
          if (firstSeries.chapters && firstSeries.chapters.length > 0) {
            currentChapterId.value = firstSeries.chapters[0].id;
          }
        }
      }
    } catch (err) {
      console.error('Error loading series from API:', err);
      error.value = 'Failed to load series data';
    } finally {
      isLoading.value = false;
    }
  };

  // Initialize data on mount
  onMounted(() => {
    loadSeriesFromAPI();
  });

  const createSeries = async (name: string, description?: string): Promise<Series | null> => {
    try {
      // Try to create on API first
      const apiResponse = await createSeriesAPI(name, description);
      
      if (apiResponse.success && apiResponse.data) {
        // Add to local state
        series.value.push(apiResponse.data);
        
        // Set as current series if it's the first one
        if (!currentSeriesId.value) {
          currentSeriesId.value = apiResponse.data.id;
        }
        
        return apiResponse.data;
      } else {
        // Fallback to local creation if API fails
        return createSeriesLocal(name, description);
      }
    } catch (err) {
      console.error('Error creating series via API, falling back to local:', err);
      return createSeriesLocal(name, description);
    }
  };

  // Local series creation as fallback
  const createSeriesLocal = (name: string, description?: string): Series => {
    const newSeries: Series = {
      id: `series-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdAt: new Date(),
      chapters: [],
    };
    
    series.value.push(newSeries);
    
    // Set as current series if it's the first one
    if (!currentSeriesId.value) {
      currentSeriesId.value = newSeries.id;
    }
    
    return newSeries;
  };

  const updateSeries = async (seriesId: string, updates: Partial<Series>): Promise<void> => {
    const index = series.value.findIndex(s => s.id === seriesId);
    if (index !== -1) {
      series.value[index] = { ...series.value[index], ...updates };
    }
  };

  const deleteSeries = async (seriesId: string): Promise<void> => {
    series.value = series.value.filter(s => s.id !== seriesId);
    
    // Update current series if the removed one was selected
    if (currentSeriesId.value === seriesId) {
      currentSeriesId.value = series.value.length > 0 ? series.value[0].id : null;
    }
    
    // Update current chapter if it belonged to the removed series
    if (currentChapterId.value) {
      const chapterExists = chapters.value.some(ch => ch.id === currentChapterId.value);
      if (!chapterExists) {
        currentChapterId.value = chapters.value.length > 0 ? chapters.value[0].id : null;
      }
    }
  };

  const selectSeries = (seriesId: string): void => {
    currentSeriesId.value = seriesId;
    
    // Auto-select first chapter in the series if available
    const selectedSeries = series.value.find(s => s.id === seriesId);
    if (selectedSeries && selectedSeries.chapters.length > 0) {
      currentChapterId.value = selectedSeries.chapters[0].id;
    } else {
      currentChapterId.value = null;
    }
  };

  // Select a series and clear current chapter to show series-level context (e.g., glossary)
  const selectSeriesOnly = (seriesId: string): void => {
    currentSeriesId.value = seriesId;
    currentChapterId.value = null;
  };

  const addChapter = async (file: File, targetSeriesId?: string): Promise<void> => {
    try {
      const content = await parseFileContent(file);
      await addChapterFromText(content, file.name.replace(/\.[^/.]+$/, ''), targetSeriesId, file);
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error('Failed to process file');
    }
  };

  const addChapterFromText = async (content: string, title: string, targetSeriesId?: string, originalFile?: File): Promise<void> => {
    try {
      // Ensure we have a series to add the chapter to
      let seriesId = targetSeriesId || currentSeriesId.value;
      
      if (!seriesId) {
        // Create a default series if none exists
        const defaultSeries = await createSeries('Default Series', 'Automatically created series');
        seriesId = defaultSeries?.id || null;
      }
      
      if (!seriesId) {
        throw new Error('Failed to create or find a series for the chapter');
      }
      
      const chapterId = originalFile ? originalFile.name : `scraped-${Date.now()}`;

      const chapter: Chapter = {
        id: chapterId,
        title,
        content,
        translatedContent: '',
        paragraphs: buildParagraphs(content, chapterId),
        seriesId: seriesId,
      };

      // Add chapter to the appropriate series
      const targetSeries = series.value.find(s => s.id === seriesId);
      if (targetSeries) {
        targetSeries.chapters.push(chapter);
        targetSeries.chapters = [...targetSeries.chapters];
      }
      
      if (!currentChapterId.value) {
        currentChapterId.value = chapter.id;
      }
      
      if (currentSeriesId.value !== chapter.seriesId) {
        currentChapterId.value = chapter.id;
        currentSeriesId.value = chapter.seriesId;
      }
    } catch (error) {
      console.error('Error creating chapter from text:', error);
      throw new Error('Failed to create chapter');
    }
  };

  const selectChapter = (chapterId: string): void => {
    currentChapterId.value = chapterId;
    
    // Update current series based on selected chapter
    const chapter = chapters.value.find(ch => ch.id === chapterId);
    if (chapter) {
      currentSeriesId.value = chapter.seriesId;
    }
  };

  const updateChapter = async (chapterId: string, updates: Partial<Chapter>): Promise<void> => {
    series.value.forEach(s => {
      const chapterIndex = s.chapters.findIndex(ch => ch.id === chapterId);
      if (chapterIndex !== -1) {
        s.chapters[chapterIndex] = { ...s.chapters[chapterIndex], ...updates };
      }
    });
  };

  const removeChapter = (chapterId: string): void => {
    // Find and remove chapter from its series
    series.value.forEach(s => {
      s.chapters = s.chapters.filter(chapter => chapter.id !== chapterId);
    });
    
    if (currentChapterId.value === chapterId) {
      currentChapterId.value = chapters.value.length > 0 ? chapters.value[0].id : null;
    }
  };

  const updateParagraphTranslation = (paragraphId: string, translation: string): void => {
    const chapter = chapters.value.find(ch =>
      ch.paragraphs.some(p => p.id === paragraphId)
    );
    
    if (chapter) {
      const paragraph = chapter.paragraphs.find(p => p.id === paragraphId);
      if (paragraph) {
        paragraph.translatedText = translation;
      }
    }
  };

  const toggleParagraphEditing = (paragraphId: string): void => {
    const chapter = chapters.value.find(ch =>
      ch.paragraphs.some(p => p.id === paragraphId)
    );
    
    if (chapter) {
      const paragraph = chapter.paragraphs.find(p => p.id === paragraphId);
      if (paragraph) {
        paragraph.isEditing = !paragraph.isEditing;
      }
    }
  };

  // Refresh data from API
  const refresh = async (): Promise<void> => {
    // Reset loaded state to force reload
    dataLoaded = false;
    await loadSeriesFromAPI();
  };

  // Force reload data (clears cache)
  const forceReload = async (): Promise<void> => {
    dataLoaded = false;
    series.value = [];
    await loadSeriesFromAPI();
  };
  return {
    series: computed(() => series.value),
    chapters: computed(() => chapters.value),
    currentChapter,
    currentChapterId,
    currentSeries,
    currentSeriesId,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    createSeries,
    updateSeries,
    deleteSeries,
    selectSeries,
    selectSeriesOnly,
    addChapter,
    addChapterFromText,
    selectChapter,
    updateChapter,
    removeChapter,
    updateParagraphTranslation,
    toggleParagraphEditing,
    refresh,
    forceReload,
    loadSeriesFromAPI,
  };
}