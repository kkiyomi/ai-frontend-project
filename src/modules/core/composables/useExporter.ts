/**
 * Core Module - Generic Export Composable
 *
 * Provides a reusable base for exporting data in various formats.
 * Uses TypeScript generics to maintain type safety across different data types.
 *
 * Design Decisions:
 * 1. Generic Types: T (source data) and U (export format) for flexibility
 * 2. Strategy Pattern: Different formatters for different export types
 * 3. Template Method: prepareData() can be overridden by specific implementations
 * 4. Browser-native APIs: Uses Blob and URL.createObjectURL for downloads
 * 5. Extensible: Easy to add new export formats via formatters
 * 6. Customizable text export: textFormatter and itemSeparator options for TXT format
 *
 * Usage Example:
 * ```typescript
 * const exporter = useExporter<Chapter[], ExportChapter[]>({
 *   prepareData: (chapters) => chapters.map(transformChapter),
 *   filename: 'chapters'
 * });
 * 
 * await exporter.exportData(chapters, 'json');
 * 
 * // Custom text export
 * await exporter.exportData(chapters, 'txt', {
 *   textFormatter: (item) => item.translatedText,
 *   itemSeparator: '\n---\n'
 * });
 * ```
 */

import { ref, computed } from 'vue';
import { createZipFromItems, createNestedZip, isZipExport, sanitizeFilename } from '../utils/zip';
import { ExportEngine, ExportEngineConfig, SingleFileExportStrategy, ZipExportStrategy, NestedZipExportStrategy } from '../exportEngine';
import { downloadArtifact } from '../utils/download';
import type { DataFormatter, ExportArtifact } from '../types/formatters';

// Export format types - now open string for formatter IDs
export type ExportFormat = string;

// Default formatter IDs for backward compatibility
export const DEFAULT_FORMATTER_IDS = {
  JSON: 'json',
  CSV: 'csv',
  TXT: 'txt',
} as const;

export type DefaultFormatterId = typeof DEFAULT_FORMATTER_IDS[keyof typeof DEFAULT_FORMATTER_IDS];

// Export options interface
export interface ExportOptions {
  filename?: string;
  timestamp?: boolean;
  pretty?: boolean; // For JSON formatting
  textFormatter?: (item: any) => string; // Custom formatter for text export
  itemSeparator?: string; // Separator between items in text export (default: '\n\n')
  zipOptions?: ZipExportOptions; // Options for zip export with separate files
}

// Zip export options for separate files export
export interface ZipExportOptions {
  folderName?: string; // Folder name inside zip (default: seriesId or timestamp)
  fileNameFormatter?: (item: any, index: number) => string; // Custom filename per item
  fileExtension?: string; // Override file extension (default: based on format)
  includeManifest?: boolean; // Include manifest.json with metadata (default: false)
}

// Base export configuration
export interface ExporterConfig<T, U> {
  prepareData?: (data: T) => U;
  defaultFilename?: string;
  defaultOptions?: ExportOptions;
}

// Export result interface
export interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
  size?: number; // File size in bytes
}



/**
 * JSON formatter implementation
 */
class JsonFormatter<U> implements DataFormatter<U> {
  id = DEFAULT_FORMATTER_IDS.JSON;
  mimeType = 'application/json';
  fileExtension = 'json';
  supportsZip = true;

  format(data: U, options?: ExportOptions): string {
    return JSON.stringify(data, null, options?.pretty ? 2 : 0);
  }

  formatItem(item: any, options?: ExportOptions): string {
    return JSON.stringify(item, null, options?.pretty ? 2 : 0);
  }
}

/**
 * CSV formatter implementation
 * Handles flat objects and arrays of objects
 */
class CsvFormatter<U> implements DataFormatter<U> {
  id = DEFAULT_FORMATTER_IDS.CSV;
  mimeType = 'text/csv';
  fileExtension = 'csv';
  supportsZip = false; // CSV doesn't make sense for zip export (single file format)

  format(data: U, options?: ExportOptions): string {
    if (!Array.isArray(data)) {
      throw new Error('CSV export requires array data');
    }

    if (data.length === 0) {
      return '';
    }

    // Get headers from first object
    const firstItem = data[0];
    if (typeof firstItem !== 'object' || firstItem === null) {
      throw new Error('CSV export requires array of objects');
    }

    const headers = Object.keys(firstItem as Record<string, any>);
    const csvHeaders = headers.map(this.escapeCsvValue).join(',');

    // Convert data rows
    const csvRows = data.map((item: any) => {
      return headers.map(header => {
        const value = item[header];
        return this.escapeCsvValue(this.formatCsvValue(value));
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  private formatCsvValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  }

  private escapeCsvValue(value: string): string {
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

/**
 * Plain text formatter implementation
 * Supports custom formatting via options.textFormatter and options.itemSeparator
 */
class TxtFormatter<U> implements DataFormatter<U> {
  id = DEFAULT_FORMATTER_IDS.TXT;
  mimeType = 'text/plain';
  fileExtension = 'txt';
  supportsZip = true;

  format(data: U, options?: ExportOptions): string {
    if (typeof data === 'string') {
      return data;
    }
    
    // Use custom formatter if provided
    const formatItem = options?.textFormatter || this.formatItem.bind(this);
    
    if (Array.isArray(data)) {
      const separator = options?.itemSeparator || '\n\n';
      return data.map(item => formatItem(item)).join(separator);
    }
    
    return formatItem(data);
  }

  formatItem(item: any, options?: ExportOptions): string {
    // Use custom textFormatter from options if provided
    if (options?.textFormatter) {
      return options.textFormatter(item);
    }
    
    if (typeof item === 'string') {
      return item;
    }
    
    if (typeof item === 'object' && item !== null) {
      return Object.entries(item)
        .map(([key, value]) => `${key}: ${this.formatValue(value)}`)
        .join('\n');
    }
    
    return String(item);
  }

  private formatValue(value: any): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }
}

/**
 * Generic Export Composable
 * 
 * @template T - Source data type (e.g., Chapter[], Series[])
 * @template U - Export data type (e.g., ExportChapter[], ExportSeries[])
 */
export function useExporter<T, U = T>(config: ExporterConfig<T, U> = {}) {
  // State
  const isExporting = ref(false);
  const lastExportResult = ref<ExportResult | null>(null);
  const error = ref<string | null>(null);

  // Export engine (new architecture)
  const zipStrategy = new ZipExportStrategy<U>(createZipFromItems);
  const nestedZipStrategy = new NestedZipExportStrategy<U>(createNestedZip);
  
  const engine = new ExportEngine<T, U>({
    ...config,
    formatters: [
      new JsonFormatter<U>(),
      new CsvFormatter<U>(),
      new TxtFormatter<U>(),
    ],
    defaultFormatterId: DEFAULT_FORMATTER_IDS.TXT, // Default to txt for backward compatibility
  }, undefined, zipStrategy, nestedZipStrategy);



  // Computed
  const supportedFormats = computed(() => engine.getFormatterIds());



  /**
   * Prepare data for export using configured transformer
   */
  const prepareData = (data: T): U => {
    return engine.prepareData(data);
  };

  /**
   * Generate filename with optional timestamp
   */
  const generateFilename = (
    format: ExportFormat,
    options: ExportOptions = {}
  ): string => {
    return engine.generateFilename(
      format,
      options.filename || config.defaultFilename,
      options.timestamp,
      options.zipOptions?.fileExtension
    );
  };

  /**
   * Download file using browser APIs
   */
  const download = (content: string | Blob, filename: string, mimeType: string): void => {
    try {
      const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      throw new Error(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  /**
   * Validate export format
   */
  const validateFormat = (format: ExportFormat): void => {
    try {
      engine.getFormatter(format);
    } catch {
      throw new Error(`Unsupported export format: ${format}`);
    }
  };

  /**
   * Validate data before export
   */
  const validateData = (data: T): void => {
    if (data === null || data === undefined) {
      throw new Error('Cannot export null or undefined data');
    }
  };

  /**
   * Main export function
   */
  const exportData = async (
    data: T,
    format: ExportFormat,
    options: ExportOptions = {}
  ): Promise<ExportResult> => {
    isExporting.value = true;
    error.value = null;
    
    try {
      // Validation
      validateFormat(format);
      validateData(data);

      // Merge options with defaults
      const mergedOptions = { ...config.defaultOptions, ...options };

      // Use engine for export (handles zip, single file, nested zip)
      const artifact = await engine.export(data, format, mergedOptions);
      
      // Download the artifact
      downloadArtifact(artifact);
      
      // Create result
      const result: ExportResult = {
        success: true,
        filename: artifact.filename,
        size: artifact.size,
      };

      lastExportResult.value = result;
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      error.value = errorMessage;
      
      const result: ExportResult = {
        success: false,
        error: errorMessage,
      };

      lastExportResult.value = result;
      return result;

    } finally {
      isExporting.value = false;
    }
  };

  /**
   * Export as JSON (convenience method)
   */
  const exportAsJson = (data: T, options?: ExportOptions) => {
    return exportData(data, 'json', { pretty: true, ...options });
  };

  /**
   * Export as CSV (convenience method)
   */
  const exportAsCsv = (data: T, options?: ExportOptions) => {
    return exportData(data, 'csv', options);
  };

  /**
   * Export as plain text (convenience method)
   */
  const exportAsText = (data: T, options?: ExportOptions) => {
    return exportData(data, 'txt', options);
  };

  /**
   * Get formatted preview of data without downloading
   */
  const getPreview = (
    data: T,
    format: ExportFormat,
    options: ExportOptions = {}
  ): string => {
    return engine.getPreview(data, format, options);
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Reset export state
   */
  const reset = () => {
    isExporting.value = false;
    lastExportResult.value = null;
    error.value = null;
  };

  return {
    // State
    isExporting: computed(() => isExporting.value),
    lastExportResult: computed(() => lastExportResult.value),
    error: computed(() => error.value),
    supportedFormats,

    // Core methods
    exportData,
    prepareData,
    getPreview,

    // Convenience methods
    exportAsJson,
    exportAsCsv,
    exportAsText,

    // Utility methods
    generateFilename,
    download,
    clearError,
    reset,
  };
}

/**
 * Create a specialized exporter with predefined configuration
 */
export function createExporter<T, U = T>(config: ExporterConfig<T, U>) {
  return () => useExporter<T, U>(config);
}

// Export formatter implementations for use in custom export logic
export { JsonFormatter, CsvFormatter, TxtFormatter };