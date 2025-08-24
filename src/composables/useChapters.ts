import { ref, computed } from 'vue';
import type { Chapter, Paragraph } from '../types';
import { parseFileContent } from '../utils/fileParser';

const chapters = ref<Chapter[]>([]);
const currentChapterId = ref<string | null>(null);

export function useChapters() {
  const currentChapter = computed(() => 
    chapters.value.find(chapter => chapter.id === currentChapterId.value)
  );

  const addChapter = async (file: File): Promise<void> => {
    try {
      const content = await parseFileContent(file);
      await addChapterFromText(content, file.name.replace(/\.[^/.]+$/, ''), file);
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error('Failed to process file');
    }
  };

  const addChapterFromText = async (content: string, title: string, originalFile?: File): Promise<void> => {
    try {
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
        originalFile,
      };

      chapters.value.push(chapter);
      
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
  };

  const removeChapter = (chapterId: string): void => {
    chapters.value = chapters.value.filter(chapter => chapter.id !== chapterId);
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
    chapters: computed(() => chapters.value),
    currentChapter,
    currentChapterId,
    addChapter,
    addChapterFromText,
    selectChapter,
    removeChapter,
    updateParagraphTranslation,
    toggleParagraphEditing,
  };
}