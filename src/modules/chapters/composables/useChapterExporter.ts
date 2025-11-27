/**
 * Chapters Module - Export Composable
 *
 * Example implementation for chapter-specific export functionality
 * demonstrating complex data transformation.
 */

import { useExporter, type ExportOptions } from '@/modules/core';
import type { Chapter } from '../types';

// Export-specific type for chapters
export interface ExportChapter {
  id: string;
  title: string;
  seriesId: string;
  originalText: string;
  translatedText: string;
  paragraphCount: number;
  translatedParagraphCount: number;
  translationProgress: number;
  wordCount: number;
  createdAt: string;
}

/**
 * Transform chapter data for export with complex calculations
 */
const prepareChapterData = (chapters: Chapter[]): ExportChapter[] => {
  return chapters.map(chapter => {
    const originalText = chapter.originalParagraphs.join('\n\n');
    const translatedText = chapter.translatedParagraphs.join('\n\n');
    const translatedCount = chapter.translatedParagraphs.filter(p => p.trim()).length;
    const progress = chapter.originalParagraphs.length > 0 
      ? Math.round((translatedCount / chapter.originalParagraphs.length) * 100)
      : 0;

    return {
      id: chapter.id,
      title: chapter.title,
      seriesId: chapter.seriesId,
      originalText,
      translatedText,
      paragraphCount: chapter.originalParagraphs.length,
      translatedParagraphCount: translatedCount,
      translationProgress: progress,
      wordCount: originalText.split(/\s+/).length,
      createdAt: new Date().toISOString(), // Would use actual creation date
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
    const translatedChapters = chapters.filter(ch => 
      ch.translatedParagraphs.some(p => p.trim())
    );
    
    return exporter.exportData(translatedChapters, format, {
      filename: 'translated-chapters',
      ...options,
    });
  };

  /**
   * Export chapter statistics only
   */
  const exportChapterStats = async (
    chapters: Chapter[],
    format: 'json' | 'csv',
    options?: ExportOptions
  ) => {
    const stats = prepareChapterData(chapters).map(ch => ({
      id: ch.id,
      title: ch.title,
      paragraphCount: ch.paragraphCount,
      translatedParagraphCount: ch.translatedParagraphCount,
      translationProgress: ch.translationProgress,
      wordCount: ch.wordCount,
    }));

    return exporter.exportData(stats as any, format, {
      filename: 'chapter-statistics',
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
    exportChapterStats,
    exportCurrentChapter,
  };
}