/**
 * Core Module - Zip Export Utilities
 *
 * Provides utilities for creating zip archives with separate files for each data item.
 */

import JSZip from 'jszip';
import type { ExportOptions, ZipExportOptions } from '../composables/useExporter';
import type { DataFormatter } from '../types/formatters';

/**
 * Sanitize filename by removing unsafe characters
 */
export function sanitizeFilename(name: string): string {
  // Replace characters that are problematic in filenames
  return name
    .replace(/[<>:"/\\|?*]/g, '-') // Windows reserved characters
    .replace(/\s+/g, '-')          // Spaces to hyphens
    .replace(/-+/g, '-')           // Multiple hyphens to single
    .replace(/^-+/, '')            // Remove leading hyphens
    .replace(/-+$/, '');           // Remove trailing hyphens
}

/**
 * Default file name formatter
 */
export function defaultFileNameFormatter(item: any, index: number): string {
  if (item.title && typeof item.title === 'string') {
    return sanitizeFilename(item.title);
  }
  if (item.name && typeof item.name === 'string') {
    return sanitizeFilename(item.name);
  }
  if (item.id && typeof item.id === 'string') {
    return sanitizeFilename(item.id);
  }
  return `file-${index + 1}`;
}

/**
 * Get file extension for a given formatter
 */
export function getFileExtension(formatter: DataFormatter<any>, customExtension?: string): string {
  if (customExtension) {
    return customExtension.startsWith('.') ? customExtension.slice(1) : customExtension;
  }
  
  return formatter.fileExtension;
}

/**
 * Create a zip archive from multiple items, each as a separate file
 * @param itemFormatter Function to format each individual item as string
 */
export async function createZipFromItems<T>(
  items: T[],
  formatter: DataFormatter<T>,
  options: ExportOptions,
  itemFormatter: (item: T) => string
): Promise<Blob> {
  if (!items.length) {
    throw new Error('Cannot create zip archive from empty items array');
  }

  const zip = new JSZip();
  const zipOptions = options.zipOptions || {};
  
  // Determine folder name
  const folderName = zipOptions.folderName || 'export';
  const folder = zip.folder(folderName);
  if (!folder) {
    throw new Error('Failed to create folder in zip archive');
  }
  
  // Determine file name formatter
  const fileNameFormatter = zipOptions.fileNameFormatter || defaultFileNameFormatter;
  const fileExtension = getFileExtension(formatter, zipOptions.fileExtension);
  
  // Add each item as a separate file
  items.forEach((item, index) => {
    const fileName = fileNameFormatter(item, index);
    const safeFileName = sanitizeFilename(fileName);
    const fullFileName = `${safeFileName}.${fileExtension}`;
    const content = itemFormatter(item);
    
    folder.file(fullFileName, content);
  });
  
  // Add manifest if requested
  if (zipOptions.includeManifest) {
    const manifest = {
      metadata: {
        exportedAt: new Date().toISOString(),
        format: formatter.id,
        totalItems: items.length,
        folderName,
      },
      files: items.map((item, index) => {
        const fileName = fileNameFormatter(item, index);
        const safeFileName = sanitizeFilename(fileName);
        return `${safeFileName}.${fileExtension}`;
      }),
    };
    folder.file('manifest.json', JSON.stringify(manifest, null, 2));
  }
  
  // Generate zip blob
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6, // Default compression level
    },
  });
}

/**
 * Check if zip export is requested
 */
export function isZipExport(options: ExportOptions): boolean {
  return !!options.zipOptions;
}

/**
 * Interface for nested zip structure
 */
export interface NestedZipItem<T> {
  folderName: string;
  items: T[];
}

/**
 * Create a zip archive with nested folder structure
 * @param nestedItems Array of folders with their items
 * @param format File format for individual files
 * @param options Export options
 * @param itemFormatter Function to format each individual item as string
 * @param fileNameFormatter Optional custom file name formatter (default uses item.title or item.name)
 */
export async function createNestedZip<T>(
  nestedItems: NestedZipItem<T>[],
  formatter: DataFormatter<T>,
  options: ExportOptions,
  itemFormatter: (item: T) => string,
  fileNameFormatter?: (item: T, index: number) => string
): Promise<Blob> {
  if (!nestedItems.length) {
    throw new Error('Cannot create zip archive from empty nested items');
  }

  const zip = new JSZip();
  const zipOptions = options.zipOptions || {};
  const fileExtension = getFileExtension(formatter, zipOptions.fileExtension);
  const useFileNameFormatter = fileNameFormatter || defaultFileNameFormatter;
  
  // Add manifest data for tracking
  const manifestData: Array<{
    folder: string;
    files: string[];
    itemCount: number;
  }> = [];
  
  // Process each folder
  nestedItems.forEach((folderItem) => {
    const { folderName, items } = folderItem;
    
    if (!items.length) {
      // Skip empty folders
      return;
    }
    
    const safeFolderName = sanitizeFilename(folderName);
    const folder = zip.folder(safeFolderName);
    if (!folder) {
      throw new Error(`Failed to create folder '${safeFolderName}' in zip archive`);
    }
    
    // Track files for manifest
    const folderFiles: string[] = [];
    
    // Add each item as a separate file
    items.forEach((item, index) => {
      const fileName = useFileNameFormatter(item, index);
      const safeFileName = sanitizeFilename(fileName);
      const fullFileName = `${safeFileName}.${fileExtension}`;
      const content = itemFormatter(item);
      
      folder.file(fullFileName, content);
      folderFiles.push(fullFileName);
    });
    
    manifestData.push({
      folder: safeFolderName,
      files: folderFiles,
      itemCount: items.length,
    });
  });
  
  // Add root manifest if requested
  if (zipOptions.includeManifest) {
    const manifest = {
      metadata: {
        exportedAt: new Date().toISOString(),
        format: formatter.id,
        totalFolders: manifestData.length,
        totalItems: manifestData.reduce((sum, folder) => sum + folder.itemCount, 0),
      },
      folders: manifestData,
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  }
  
  // Generate zip blob
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6, // Default compression level
    },
  });
}