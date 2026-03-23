/**
 * Chapters Module - Export Composable
 *
 * Example implementation for chapter-specific export functionality
 * demonstrating complex data transformation.
 *
 * New features (text export customization):
 * - exportChapterAsText: Export single chapter as plain text with only translated content
 * - exportChaptersAsText: Export multiple chapters as plain text with only translated content
 * - Custom text formatting via options.textFormatter
 * - Custom item separation via options.itemSeparator
 *
 * Usage Example:
 * ```typescript
 * import { useChapterExporter } from '@/modules/chapters';
 *
 * const chapterExporter = useChapterExporter();
 *
 * // Export chapter as text with only translated content
 * await chapterExporter.exportChapterAsText(chapter, {
 *   filename: 'my-chapter',
 *   itemSeparator: '\n---\n'
 * });
 *
 * // Custom text formatter for CSV export (using textFormatter option)
 * await chapterExporter.exportCurrentChapter(chapter, 'txt', {
 *   textFormatter: (item) => `${item.title}\n\n${item.translatedText}`
 * });
 * ```
 */

import { useExporter, type ExportOptions, type ZipExportOptions } from '@/modules/core';
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

  /**
   * Export chapter as plain text with only translated content
   */
  const exportChapterAsText = async (
    chapter: Chapter,
    options?: ExportOptions
  ) => {
    return exporter.exportData([chapter], 'txt', {
      filename: chapter.title.replace(/[^a-zA-Z0-9]/g, '-'),
      textFormatter: (item: any) => {
        const title = item?.title ?? '';
        const content = item?.translatedText ?? '';

        return [title, content].filter(Boolean).join('\n\n');
      },
      timestamp: false,
      ...options,
    });
  };

  /**
   * Export multiple chapters as plain text with only translated content
   */
  const exportChaptersAsText = async (
    chapters: Chapter[],
    options?: ExportOptions
  ) => {
    return exporter.exportData(chapters, 'txt', {
      filename: 'chapters-translated',
      textFormatter: (item: any) => {
        const title = item?.title ?? '';
        const content = item?.translatedText ?? '';

        return [title, content].filter(Boolean).join('\n\n');
      },
      timestamp: false,
      ...options,
    });
  };

  /**
   * Export chapters as zip archive with each chapter as separate file
   */
  const exportChaptersAsZip = async (
    chapters: Chapter[],
    options: ExportOptions = {}
  ) => {
    if (!chapters.length) {
      throw new Error('No chapters to export');
    }

    // Determine series ID for folder name (use first chapter's seriesId)
    const seriesId = chapters[0]?.seriesId;
    const zipOptions: ZipExportOptions = {
      folderName: seriesId ? `series-${seriesId}` : 'chapters',
      fileNameFormatter: (item) => item.title,
      ...options.zipOptions,
    };

    // Use txt format by default, but allow override via options
    const format = options.zipOptions?.fileExtension === 'json' ? 'json' : 'txt';
    
    return exporter.exportData(chapters, format, {
      ...options,
      zipOptions,
    });
  };

  return {
    ...exporter,
    exportTranslatedChapters,
    exportCurrentChapter,
    exportChapterAsText,
    exportChaptersAsText,
    exportChaptersAsZip,
  };
}