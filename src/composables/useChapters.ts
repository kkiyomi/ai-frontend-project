import { ref, computed } from 'vue';
import type { Chapter, Paragraph, Series } from '../types';
import { parseFileContent } from '../utils/fileParser';

const series = ref<Series[]>([]);
const currentChapterId = ref<string | null>(null);
const currentSeriesId = ref<string | null>(null);

export function useChapters() {
  const chapters = computed(() => 
    series.value.flatMap(s => s.chapters)
  );

  const currentChapter = computed(() => 
    chapters.value.find(chapter => chapter.id === currentChapterId.value)
  );

  const currentSeries = computed(() =>
    series.value.find(s => s.id === currentSeriesId.value)
  );

  const createSeries = (name: string, description?: string): Series => {
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

  const removeSeries = (seriesId: string): void => {
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
        const defaultSeries = createSeries('Default Series', 'Automatically created series');
        seriesId = defaultSeries.id;
      }
      
      const chapterId = originalFile ? originalFile.name : `scraped-${Date.now()}`;
      const paragraphs = content.split('\n').map(p => p.trim()).filter(p => p.length > 0).map((text, index) => ({
        id: `${chapterId}-p${index}`,
        originalText: text,
        translatedText: '',
        isEditing: false,
        chapterId,
      }));

      const chapter: Chapter = {
        id: chapterId,
        title,
        content,
        paragraphs,
        seriesId: seriesId!,
        originalFile,
      };

      // Add chapter to the appropriate series
      const targetSeries = series.value.find(s => s.id === seriesId);
      if (targetSeries) {
        targetSeries.chapters.push(chapter);
      }
      
      if (!currentChapterId.value) {
        currentChapterId.value = chapter.id;
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

  return {
    series: computed(() => series.value),
    chapters: computed(() => chapters.value),
    currentChapter,
    currentChapterId,
    currentSeries,
    currentSeriesId,
    createSeries,
    removeSeries,
    selectSeries,
    addChapter,
    addChapterFromText,
    selectChapter,
    removeChapter,
    updateParagraphTranslation,
    toggleParagraphEditing,
  };
}