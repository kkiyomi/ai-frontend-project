/**
 * Core Module - Export Engine
 *
 * Pure logic export engine with no Vue or DOM dependencies.
 * Implements the plugin-based formatter architecture.
 * 
 * Responsibilities:
 * - Data transformation via prepareData function
 * - Formatter registry management
 * - Export strategy execution (single file vs zip)
 * - Export artifact generation
 * 
 * Design Principles:
 * 1. Separation of concerns: Logic vs transport vs UI state
 * 2. Plugin architecture: Runtime formatter registration
 * 3. Strategy pattern: Different export modes (single, zip)
 * 4. Immutable operations: No side effects
 */

import type { DataFormatter, ExportArtifact, ExportStrategy, ExportOptions, ZipExportOptions, ExporterConfig } from './types/formatters';
import type { NestedZipItem } from './utils/zip';

/**
 * Extended exporter configuration for the engine.
 * Adds formatter registry support.
 */
export interface ExportEngineConfig<T, U> extends ExporterConfig<T, U> {
  formatters?: DataFormatter<U>[];
  defaultFormatterId?: string;
}

/**
 * Single file export strategy.
 * Formats the entire dataset as a single file.
 */
export class SingleFileExportStrategy<U> implements ExportStrategy<U> {
  async execute(
    data: U,
    formatter: DataFormatter<U>,
    options: ExportOptions
  ): Promise<ExportArtifact> {
    const content = formatter.format(data, options);
    const blob = content instanceof Blob ? content : new Blob([content], { type: formatter.mimeType });
    
    return {
      content: blob,
      mimeType: formatter.mimeType,
      filename: '', // Filename will be set by caller
      size: blob.size,
    };
  }
}

/**
 * Zip export strategy.
 * Exports each item as a separate file within a zip archive.
 * Requires array data and a formatter with formatItem method.
 */
export class ZipExportStrategy<U> implements ExportStrategy<U> {
  constructor(
    private createZipFromItems: <T>(
      items: T[],
      formatter: DataFormatter<T>,
      options: ExportOptions,
      itemFormatter: (item: T) => string
    ) => Promise<Blob>
  ) {}

  async execute(
    data: U,
    formatter: DataFormatter<U>,
    options: ExportOptions
  ): Promise<ExportArtifact> {
    // Validate data is array for zip export
    if (!Array.isArray(data)) {
      throw new Error('Zip export requires array data');
    }

    // Validate formatter supports zip export
    if (formatter.supportsZip === false) {
      throw new Error(`Formatter '${formatter.id}' does not support zip export`);
    }

    // Get item formatter - use formatItem if provided, otherwise use formatter.format for single items
    const itemFormatter = (item: any): string => {
      if (formatter.formatItem) {
        return formatter.formatItem(item, options);
      }
      
      // Fallback: format single item using the main formatter
      const formatted = formatter.format(item as U, options);
      if (typeof formatted !== 'string') {
        throw new Error(`Formatter '${formatter.id}' must return string for zip export or implement formatItem()`);
      }
      return formatted;
    };

    // Create zip blob
    const zipBlob = await this.createZipFromItems(data, formatter, options, itemFormatter);
    
    return {
      content: zipBlob,
      mimeType: 'application/zip',
      filename: '', // Filename will be set by caller
      size: zipBlob.size,
    };
  }
}

/**
 * Nested zip export strategy.
 * Exports nested structure with folders and items.
 */
export class NestedZipExportStrategy<U> implements ExportStrategy<U> {
  constructor(
    private createNestedZip: <T>(
      nestedItems: NestedZipItem<T>[],
      formatter: DataFormatter<T>,
      options: ExportOptions,
      itemFormatter: (item: T) => string,
      fileNameFormatter?: (item: T, index: number) => string
    ) => Promise<Blob>
  ) {}

  async execute(
    data: U,
    formatter: DataFormatter<U>,
    options: ExportOptions
  ): Promise<ExportArtifact> {
    // For nested zip, data must be array of NestedZipItem
    if (!Array.isArray(data)) {
      throw new Error('Nested zip export requires array of NestedZipItem');
    }

    // Validate formatter supports zip export
    if (formatter.supportsZip === false) {
      throw new Error(`Formatter '${formatter.id}' does not support zip export`);
    }

    // Get item formatter
    const itemFormatter = (item: any): string => {
      if (formatter.formatItem) {
        return formatter.formatItem(item, options);
      }
      
      const formatted = formatter.format(item as U, options);
      if (typeof formatted !== 'string') {
        throw new Error(`Formatter '${formatter.id}' must return string for zip export or implement formatItem()`);
      }
      return formatted;
    };

    const zipBlob = await this.createNestedZip(
      data as NestedZipItem<any>[],
      formatter,
      options,
      itemFormatter,
      options.zipOptions?.fileNameFormatter as any
    );
    
    return {
      content: zipBlob,
      mimeType: 'application/zip',
      filename: '',
      size: zipBlob.size,
    };
  }
}

/**
 * Main export engine class.
 * Manages formatter registry and coordinates export operations.
 */
export class ExportEngine<T, U = T> {
  private formatters = new Map<string, DataFormatter<U>>();
  private defaultFormatterId?: string;
  
  constructor(
    private config: ExportEngineConfig<T, U> = {},
    private singleFileStrategy = new SingleFileExportStrategy<U>(),
    private zipStrategy?: ZipExportStrategy<U>,
    private nestedZipStrategy?: NestedZipExportStrategy<U>
  ) {
    // Register default formatters if provided in config
    if (config.formatters) {
      config.formatters.forEach((formatter: DataFormatter<U>) => this.registerFormatter(formatter));
    }
    
    // Set default formatter ID if provided
    if (config.defaultFormatterId) {
      this.setDefaultFormatter(config.defaultFormatterId);
    }
  }

  /**
   * Register a new formatter.
   */
  registerFormatter(formatter: DataFormatter<U>): void {
    this.formatters.set(formatter.id, formatter);
    
    // Set as default if it's the first formatter and no default is set
    if (!this.defaultFormatterId) {
      this.defaultFormatterId = formatter.id;
    }
  }

  /**
   * Get a formatter by ID.
   */
  getFormatter(formatterId: string): DataFormatter<U> {
    const formatter = this.formatters.get(formatterId);
    if (!formatter) {
      throw new Error(`Formatter not found: ${formatterId}. Registered formatters: ${Array.from(this.formatters.keys()).join(', ')}`);
    }
    return formatter;
  }

  /**
   * Get all registered formatter IDs.
   */
  getFormatterIds(): string[] {
    return Array.from(this.formatters.keys());
  }

  /**
   * Set default formatter ID.
   */
  setDefaultFormatter(formatterId: string): void {
    if (!this.formatters.has(formatterId)) {
      throw new Error(`Cannot set unknown formatter as default: ${formatterId}`);
    }
    this.defaultFormatterId = formatterId;
  }

  /**
   * Get default formatter ID.
   */
  getDefaultFormatterId(): string | undefined {
    return this.defaultFormatterId;
  }

  /**
   * Prepare data for export using configured transformer.
   */
  prepareData(data: T): U {
    const transformer = this.config.prepareData || ((d: T) => d as unknown as U);
    return transformer(data);
  }

  /**
   * Generate filename for export.
   */
  generateFilename(
    formatterId: string,
    baseName?: string,
    timestamp?: boolean,
    customExtension?: string
  ): string {
    const formatter = this.getFormatter(formatterId);
    const base = baseName || this.config.defaultFilename || 'export';
    const ts = timestamp !== false ? 
      new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-') : '';
    const extension = customExtension || formatter.fileExtension;
    
    return ts ? `${base}_${ts}.${extension}` : `${base}.${extension}`;
  }

  /**
   * Check if zip export is requested.
   */
  isZipExport(options: ExportOptions): boolean {
    return !!options.zipOptions;
  }

  /**
   * Check if nested zip export is requested.
   */
  isNestedZipExport(data: U): boolean {
    return Array.isArray(data) && data.length > 0 && 
           typeof data[0] === 'object' && data[0] !== null &&
           'folderName' in (data[0] as any) && 'items' in (data[0] as any);
  }

  /**
   * Main export method.
   */
  async export(
    data: T,
    formatterId: string,
    options: ExportOptions = {}
  ): Promise<ExportArtifact> {
    // Get formatter
    const formatter = this.getFormatter(formatterId);
    
    // Prepare data
    const exportData = this.prepareData(data);
    
    // Determine strategy
    let strategy: ExportStrategy<U>;
    
    if (this.isNestedZipExport(exportData)) {
      if (!this.nestedZipStrategy) {
        throw new Error('Nested zip strategy not configured');
      }
      strategy = this.nestedZipStrategy;
    } else if (this.isZipExport(options)) {
      if (!this.zipStrategy) {
        throw new Error('Zip strategy not configured');
      }
      strategy = this.zipStrategy;
    } else {
      strategy = this.singleFileStrategy;
    }
    
    // Execute strategy
    const artifact = await strategy.execute(exportData, formatter, options);
    
    // Generate filename if not already set
    if (!artifact.filename) {
      const zipOptions = options.zipOptions;
      const isZip = this.isZipExport(options) || this.isNestedZipExport(exportData);
      
      if (isZip) {
        // For zip files, use .zip extension
        const base = options.filename || this.config.defaultFilename || 'export';
        const timestamp = options.timestamp !== false ? 
          new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-') : '';
        artifact.filename = timestamp ? `${base}_${timestamp}.zip` : `${base}.zip`;
      } else {
        // For single files, use formatter's extension
        artifact.filename = this.generateFilename(
          formatterId,
          options.filename,
          options.timestamp,
          zipOptions?.fileExtension
        );
      }
    }
    
    return artifact;
  }

  /**
   * Get formatted preview without downloading.
   */
  getPreview(
    data: T,
    formatterId: string,
    options: ExportOptions = {}
  ): string {
    const formatter = this.getFormatter(formatterId);
    const exportData = this.prepareData(data);
    const content = formatter.format(exportData, options);
    
    if (typeof content !== 'string') {
      throw new Error(`Formatter '${formatterId}' must return string for preview`);
    }
    
    return content;
  }
}