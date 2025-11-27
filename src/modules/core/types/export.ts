/**
 * Core Module - Export Types
 *
 * Shared types for the export functionality
 */

export type { ExportFormat, ExportOptions, ExportResult } from '../composables/useExporter';

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