/**
 * Core Module - Formatter Types
 *
 * Defines the plugin-based formatter architecture for export functionality.
 * Replaces the closed ExportFormat union with open, pluggable formatters.
 */

// Import base types from useExporter for compatibility
import type { ExportOptions, ZipExportOptions, ExportResult, ExporterConfig } from '../composables/useExporter';

/**
 * Data formatter interface for different export formats.
 * Each formatter is identified by a unique ID and can be registered at runtime.
 * 
 * @template U - The data type that this formatter accepts
 */
export interface DataFormatter<U> {
  /**
   * Unique identifier for the formatter (e.g., 'json', 'csv', 'txt').
   * Replaces the ExportFormat enum/union.
   */
  id: string;
  
  /**
   * MIME type for the output format (e.g., 'application/json', 'text/csv').
   */
  mimeType: string;
  
  /**
   * File extension without the dot (e.g., 'json', 'csv', 'txt').
   */
  fileExtension: string;
  
  /**
   * Whether this formatter supports zip export (multiple files in archive).
   * Defaults to true unless specified otherwise.
   */
  supportsZip?: boolean;
  
  /**
   * Format the complete dataset for single-file export.
   * 
   * @param data - The data to format
   * @param options - Export options
   * @returns Formatted content as string or Blob
   */
  format(data: U, options?: ExportOptions): string | Blob;
  
  /**
   * Format a single item for zip export (when each item is a separate file).
   * Optional - if not provided, the formatter should handle single-item formatting
   * within the format() method.
   * 
   * @param item - A single item from the dataset
   * @param options - Export options
   * @returns Formatted item as string
   */
  formatItem?(item: U extends Array<infer R> ? R : U, options?: ExportOptions): string;
}

/**
 * Export artifact representing the final output of an export operation.
 * This standardizes the interface between the export engine and transport layer.
 */
export interface ExportArtifact {
  /**
   * The formatted content ready for download.
   */
  content: string | Blob;
  
  /**
   * MIME type of the content.
   */
  mimeType: string;
  
  /**
   * Suggested filename for the download.
   */
  filename: string;
  
  /**
   * Optional size in bytes.
   */
  size?: number;
}

/**
 * Export strategy for handling different export modes (single file vs zip).
 */
export interface ExportStrategy<U> {
  /**
   * Execute the export strategy.
   * 
   * @param data - Data to export
   * @param formatter - Formatter to use for formatting
   * @param options - Export options
   * @returns Export artifact ready for download
   */
  execute(data: U, formatter: DataFormatter<U>, options: ExportOptions): Promise<ExportArtifact>;
}

// Re-export commonly used types from useExporter for compatibility
export type { ExportOptions, ZipExportOptions, ExportResult, ExporterConfig };