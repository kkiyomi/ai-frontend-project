// Content domain store - manages series and chapters
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '../../shared/services/apiService.js';
import { parseFileContent } from '../../shared/services/fileParserService.js';

export const useContentStore = defineStore('content', () => {
  // State
  const series = ref([]);
  const currentChapterId = ref(null);
  const currentSeriesId = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const chapters = computed(() => 
    series.value.flatMap(s => s.chapters)
  );

  const currentChapter = computed(() => 
    chapters.value.find(chapter => chapter.id === currentChapterId.value) || null
  );

  const currentSeries = computed(() =>
    series.value.find(s => s.id === currentSeriesId.value)
  );

  // Cache for loaded data
  let dataLoaded = false;
  let loadingPromise = null;

  // Helper functions
  function buildOriginalParagraphs(content) {
    return content.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  }

  function buildTranslatedParagraphs(translatedContent) {
    return translatedContent.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  }

  // Actions
  const loadSeries = async () => {
    if (loadingPromise) {
      return loadingPromise;
    }
    
    if (dataLoaded && series.value.length > 0) {
      return;
    }

    loadingPromise = performLoad();
    await loadingPromise;
    loadingPromise = null;
  };

  const performLoad = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const seriesResponse = await apiService.getSeries();
      if (seriesResponse.success && seriesResponse.data) {
        const seriesData = seriesResponse.data;
        
        const { success, data } = await apiService.getChapters();
        if (!success || !data) {
          series.value = seriesData.map(s => ({ ...s, chapters: [] }));
          return;
        }

        const loadedSeries = seriesData.map(seriesItem => ({
          ...seriesItem,
          chapters: (data.filter(c => c.seriesId === seriesItem.id) || [])
            .map(chapter => ({
              ...chapter,
              translatedContent: chapter.translatedContent || '',
              originalParagraphs: buildOriginalParagraphs(chapter.content),
              translatedParagraphs: buildTranslatedParagraphs(chapter.translatedContent || ''),
            })),
        }));

        series.value = loadedSeries;
        dataLoaded = true;

        if (series.value.length > 0) {
          currentSeriesId.value = series.value[0].id;
          
          const firstSeries = series.value[0];
          if (firstSeries.chapters && firstSeries.chapters.length > 0) {
            currentChapterId.value = firstSeries.chapters[0].id;
          }
        }
      }
    } catch (err) {
      console.error('Error loading series:', err);
      error.value = 'Failed to load series data';
    } finally {
      isLoading.value = false;
    }
  };

  const createSeries = async (name, description) => {
    try {
      const apiResponse = await apiService.createSeries(name, description);
      
      if (apiResponse.success && apiResponse.data) {
        series.value.push(apiResponse.data);
        
        if (!currentSeriesId.value) {
          currentSeriesId.value = apiResponse.data.id;
        }
        
        return apiResponse.data;
      } else {
        return createSeriesLocal(name, description);
      }
    } catch (err) {
      console.error('Error creating series via API, falling back to local:', err);
      return createSeriesLocal(name, description);
    }
  };

  const createSeriesLocal = (name, description) => {
    const newSeries = {
      id: `series-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdAt: new Date(),
      chapters: [],
    };
    
    series.value.push(newSeries);
    
    if (!currentSeriesId.value) {
      currentSeriesId.value = newSeries.id;
    }
    
    return newSeries;
  };

  const updateSeries = async (seriesId, updates) => {
    const index = series.value.findIndex(s => s.id === seriesId);
    if (index !== -1) {
      series.value[index] = { ...series.value[index], ...updates };
    }
  };

  const deleteSeries = async (seriesId) => {
    series.value = series.value.filter(s => s.id !== seriesId);
    
    if (currentSeriesId.value === seriesId) {
      currentSeriesId.value = series.value.length > 0 ? series.value[0].id : null;
    }
    
    if (currentChapterId.value) {
      const chapterExists = chapters.value.some(ch => ch.id === currentChapterId.value);
      if (!chapterExists) {
        currentChapterId.value = chapters.value.length > 0 ? chapters.value[0].id : null;
      }
    }
  };

  const selectSeries = (seriesId) => {
    currentSeriesId.value = seriesId;
    
    const selectedSeries = series.value.find(s => s.id === seriesId);
    if (selectedSeries && selectedSeries.chapters.length > 0) {
      currentChapterId.value = selectedSeries.chapters[0].id;
    } else {
      currentChapterId.value = null;
    }
  };

  const selectSeriesOnly = (seriesId) => {
    currentSeriesId.value = seriesId;
    currentChapterId.value = null;
  };

  const addChapter = async (file, targetSeriesId) => {
    try {
      const content = await parseFileContent(file);
      await addChapterFromText(content, file.name.replace(/\.[^/.]+$/, ''), targetSeriesId, file);
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error('Failed to process file');
    }
  };

  const addChapterFromText = async (content, title, targetSeriesId, originalFile) => {
    try {
      let seriesId = targetSeriesId || currentSeriesId.value;
      
      if (!seriesId) {
        const defaultSeries = await createSeries('Default Series', 'Automatically created series');
        seriesId = defaultSeries?.id || null;
      }
      
      if (!seriesId) {
        throw new Error('Failed to create or find a series for the chapter');
      }
      
      const chapterId = originalFile ? originalFile.name : `scraped-${Date.now()}`;

      const chapter = {
        id: chapterId,
        title,
        content,
        translatedContent: '',
        originalParagraphs: buildOriginalParagraphs(content),
        translatedParagraphs: [],
        seriesId: seriesId,
      };

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

  const selectChapter = (chapterId) => {
    currentChapterId.value = chapterId;
    
    const chapter = chapters.value.find(ch => ch.id === chapterId);
    if (chapter) {
      currentSeriesId.value = chapter.seriesId;
    }
  };

  const updateChapter = async (chapterId, updates) => {
    series.value.forEach(s => {
      const chapterIndex = s.chapters.findIndex(ch => ch.id === chapterId);
      if (chapterIndex !== -1) {
        s.chapters[chapterIndex] = { ...s.chapters[chapterIndex], ...updates };
      }
    });
  };

  const removeChapter = (chapterId) => {
    series.value.forEach(s => {
      s.chapters = s.chapters.filter(chapter => chapter.id !== chapterId);
    });
    
    if (currentChapterId.value === chapterId) {
      currentChapterId.value = chapters.value.length > 0 ? chapters.value[0].id : null;
    }
  };

  const refresh = async () => {
    dataLoaded = false;
    await loadSeries();
  };

  const forceReload = async () => {
    dataLoaded = false;
    series.value = [];
    await loadSeries();
  };

  return {
    // State
    series: computed(() => series.value),
    chapters,
    currentChapter,
    currentChapterId,
    currentSeries,
    currentSeriesId,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    
    // Actions
    loadSeries,
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
    refresh,
    forceReload,
  };
});

export default useContentStore;