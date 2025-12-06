/**
 * Chapters Module - Export Composable
 *
 * Example implementation for chapter-specific export functionality
 * demonstrating complex data transformation.
 */

import { useExporter, type ExportOptions } from '@/modules/core';
import type { Chapter, ExportChapter } from '../types';

/**
 * Transform chapter data for export with complex calculations
 */
const prepareChapterData = (chapters: Chapter[]): ExportChapter[] => {
  return chapters.map(chapter => {
    return {
      id: chapter.id,
      title: chapter.title,
      seriesId: chapter.seriesId,
      originalText: chapter.content,
      translatedText: chapter.translatedContent,
    };
  });
};

/**
 * Chapter-specific export composable
 */
export function useChapterExporter() {
  const exporter = useExporter<Chapter[], ExportChapter[]>({
    prepareData: prepareChapterData,
    defaultFilename: 'chapters-export',
    defaultOptions: {
      timestamp: true,
    },
  });

  /**
   * Export only translated chapters
   */
  const exportTranslatedChapters = async (
    chapters: Chapter[],
    format: 'json' | 'csv' | 'txt',
    options?: ExportOptions
  ) => {
    const translatedChapters = chapters.filter(ch => ch.isTranslated);
    
    return exporter.exportData(translatedChapters, format, {
      filename: 'translated-chapters',
      ...options,
    });
  };

  /**
   * Export current chapter only
   */
  const exportCurrentChapter = async (
    chapter: Chapter,
    format: 'json' | 'csv' | 'txt',
    options?: ExportOptions
  ) => {
    return exporter.exportData([chapter], format, {
      filename: `chapter-${chapter.title.replace(/[^a-zA-Z0-9]/g, '-')}`,
      ...options,
    });
  };

  return {
    ...exporter,
    exportTranslatedChapters,
    exportCurrentChapter,
  };
}