/**
 * Series Module - Export Composable
 *
 * Example implementation showing how to use the generic exporter
 * for series-specific data export functionality.
 */

import { useExporter, type ExportOptions } from '@/modules/core';
import type { Series } from '../types';

// Define export-specific type for series
export interface ExportSeries {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  chapterCount: number;
  translationProgress: number;
}

/**
 * Transform series data for export
 */
const prepareSeriesData = (series: Series[]): ExportSeries[] => {
  return series.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || '',
    createdAt: typeof s.createdAt === 'string' ? s.createdAt : s.createdAt.toISOString(),
    chapterCount: s.chapterIds.length,
    translationProgress: 0, // Would calculate from actual chapter data
  }));
};

/**
 * Series-specific export composable
 */
export function useSeriesExporter() {
  const exporter = useExporter<Series[], ExportSeries[]>({
    prepareData: prepareSeriesData,
    defaultFilename: 'series-export',
    defaultOptions: {
      timestamp: true,
      pretty: true,
    },
  });

  /**
   * Export series with metadata container
   */
  const exportSeriesWithMetadata = async (
    series: Series[],
    format: 'json' | 'csv' | 'txt',
    options?: ExportOptions
  ) => {
    const exportData = prepareSeriesData(series);
    
    if (format === 'json') {
      // Wrap in metadata container for JSON exports
      const container = {
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          format: 'series',
          totalItems: series.length,
        },
        data: exportData,
      };
      
      return exporter.exportAsJson(container as any, options);
    }
    
    return exporter.exportData(series, format, options);
  };

  return {
    ...exporter,
    exportSeriesWithMetadata,
  };
}