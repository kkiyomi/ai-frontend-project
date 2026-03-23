/**
 * Core Module - Export Types
 *
 * Shared types for the export functionality
 */

// Re-export types from formatters module
export type { DataFormatter, ExportArtifact, ExportStrategy } from './formatters';
export type { ExportOptions, ZipExportOptions, ExportResult, ExporterConfig } from '../composables/useExporter';

// Common export interfaces that modules can extend
export interface BaseExportItem {
  id: string;
  name: string;
  createdAt: string;
}

export interface ExportMetadata {
  exportedAt: string;
  exportedBy?: string;
  version: string;
  format: string;
  totalItems: number;
}

export interface ExportContainer<T> {
  metadata: ExportMetadata;
  data: T;
}