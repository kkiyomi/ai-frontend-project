/**
 * Composable for exporting series with chapters as nested zip archives
 *
 * Exports multiple series as zip files with folder structure:
 * - series-name/
 *   - chapter-title.txt (or .json)
 *   - chapter-title-2.txt
 * - another-series-name/
 *   - chapter-title.txt
 *
 * Supports:
 * - Export selected series (current series)
 * - Export all series
 * - Export specific series by IDs
 * - Customizable file format (txt/json) and naming
 */

import { ref, computed } from 'vue';
import type { SeriesWithChapters, Chapter } from '@/types';
import type { ExportOptions, ZipExportOptions } from '@/modules/core';
import { createNestedZip, NestedZipItem, sanitizeFilename } from '@/modules/core/utils/zip';
import { JsonFormatter, TxtFormatter, DEFAULT_FORMATTER_IDS } from '@/modules/core';
import { useSeriesWithChapters } from './useSeriesWithChapters';

/**
 * Options specific to series zip export
 */
export interface SeriesZipOptions extends ZipExportOptions {
  format?: 'txt' | 'json'; // File format for individual chapter files
  includeTranslatedOnly?: boolean; // Only include translated chapters
  chapterFileNameFormatter?: (chapter: Chapter, index: number) => string;
}

/**
 * Extended export options for series zip export
 */
export interface SeriesExportOptions extends ExportOptions {
  seriesZipOptions?: SeriesZipOptions;
}

/**
 * Series with chapters exporter composable
 */
export function useSeriesWithChaptersExporter() {
  const { selectedSeriesWithChapters, allSeriesWithChapters, getSeriesWithChapters } = useSeriesWithChapters();
  
  // State
  const isExporting = ref(false);
  const error = ref<string | null>(null);
  
  /**
   * Default chapter file name formatter
   */
  const defaultChapterFileNameFormatter = (chapter: Chapter, index: number): string => {
    return chapter.title;
  };
  
  /**
   * Default item formatter for txt format
   */
  const defaultTxtFormatter = (chapter: Chapter): string => {
    const title = chapter.title || '';
    const content = chapter.translatedContent || chapter.content || '';
    return [title, content].filter(Boolean).join('\n\n');
  };
  
  /**
   * Default item formatter for json format
   */
  const defaultJsonFormatter = (chapter: Chapter): string => {
    const exportChapter = {
      id: chapter.id,
      title: chapter.title,
      seriesId: chapter.seriesId,
      content: chapter.content,
      translatedContent: chapter.translatedContent,
      isTranslated: chapter.isTranslated,
    };
    return JSON.stringify(exportChapter, null, 2);
  };
  
  /**
   * Get item formatter based on format
   */
  const getItemFormatter = (format: 'txt' | 'json'): ((chapter: Chapter) => string) => {
    if (format === 'json') {
      return defaultJsonFormatter;
    }
    return defaultTxtFormatter;
  };
  
  /**
   * Filter chapters based on options
   */
  const filterChapters = (chapters: Chapter[], options: SeriesZipOptions): Chapter[] => {
    if (options.includeTranslatedOnly) {
      return chapters.filter(ch => ch.isTranslated);
    }
    return chapters.filter(ch => ch.translatedContent);
  };
  
  /**
   * Prepare nested zip items from series with chapters
   */
  const prepareNestedItems = (
    seriesList: SeriesWithChapters[],
    options: SeriesZipOptions
  ): NestedZipItem<Chapter>[] => {
    return seriesList
      .filter(series => series.chapters.length > 0)
      .map(series => {
        const filteredChapters = filterChapters(series.chapters, options);
        
        return {
          folderName: series.name,
          items: filteredChapters,
        };
      })
      .filter(folder => folder.items.length > 0);
  };
  
  /**
   * Export series as zip archive
   */
  const exportSeriesAsZip = async (
    seriesList: SeriesWithChapters[],
    options: SeriesExportOptions = {}
  ): Promise<void> => {
    isExporting.value = true;
    error.value = null;
    
    try {
      if (!seriesList.length) {
        throw new Error('No series to export');
      }
      
      const seriesZipOptions: SeriesZipOptions = {
        format: 'txt',
        includeTranslatedOnly: false,
        chapterFileNameFormatter: defaultChapterFileNameFormatter,
        ...options.seriesZipOptions,
      };
      
      // Prepare nested items
      const nestedItems = prepareNestedItems(seriesList, seriesZipOptions);
      
      if (!nestedItems.length) {
        throw new Error('No chapters found to export. Check if chapters exist and translation filter settings.');
      }
      
      // Get item formatter based on format
      const itemFormatter = getItemFormatter(seriesZipOptions.format || 'txt');
      
      // Merge options for zip creation (use seriesZipOptions as zipOptions)
      const mergedOptions = {
        ...options,
        zipOptions: seriesZipOptions,
      };
      
      // Get formatter based on format
      const format = seriesZipOptions.format || 'txt';
      const formatter = format === 'json' ? new JsonFormatter<Chapter>() : new TxtFormatter<Chapter>();
      
      // Create zip blob
      const zipBlob = await createNestedZip(
        nestedItems,
        formatter,
        mergedOptions,
        itemFormatter,
        seriesZipOptions.chapterFileNameFormatter
      );
      
      // Generate filename
      const base = options.filename || 'series-export';
      const timestamp = options.timestamp !== false ? 
        new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-') : '';
      const zipFilename = timestamp ? `${base}_${timestamp}.zip` : `${base}.zip`;
      
      // Download zip
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipFilename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Export failed';
      throw err;
    } finally {
      isExporting.value = false;
    }
  };
  
  /**
   * Export selected series (current series) as zip
   */
  const exportSelectedSeriesAsZip = async (
    options: SeriesExportOptions = {}
  ): Promise<void> => {
    const selectedSeries = selectedSeriesWithChapters.value;
    if (!selectedSeries) {
      throw new Error('No series selected');
    }
    
    return exportSeriesAsZip([selectedSeries], {
      filename: `series-${sanitizeFilename(selectedSeries.name)}`,
      ...options,
    });
  };
  
  /**
   * Export all series as zip
   */
  const exportAllSeriesAsZip = async (
    options: SeriesExportOptions = {}
  ): Promise<void> => {
    const allSeries = allSeriesWithChapters.value;
    return exportSeriesAsZip(allSeries, {
      filename: 'all-series',
      ...options,
    });
  };
  
  /**
   * Export specific series by IDs as zip
   */
  const exportSeriesByIdsAsZip = async (
    seriesIds: string[],
    options: SeriesExportOptions = {}
  ): Promise<void> => {
    const seriesList = getSeriesWithChapters(seriesIds);
    return exportSeriesAsZip(seriesList, options);
  };
  
  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null;
  };
  
  return {
    // State (computed for reactivity)
    isExporting: computed(() => isExporting.value),
    error: computed(() => error.value),
    
    // Methods
    exportSeriesAsZip,
    exportSelectedSeriesAsZip,
    exportAllSeriesAsZip,
    exportSeriesByIdsAsZip,
    clearError,
  };
}