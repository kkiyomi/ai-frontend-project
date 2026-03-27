/**
 * Glossary Module - Import Composable
 *
 * Specialized importer for glossary terms from CSV files.
 * Extends the core importer with glossary-specific configuration.
 *
 * Features:
 * - Column mapping for common glossary fields (term, definition, translation, category)
 * - Automatic series/chapter assignment
 * - Duplicate detection and handling
 * - Batch import with progress tracking
 *
 * Usage Example:
 * ```typescript
 * import { useGlossaryImporter } from '@/modules/glossary';
 *
 * const glossaryImporter = useGlossaryImporter({
 *   seriesId: 'current-series-id',
 *   columnMapping: {
 *     'Term': 'term',
 *     'Definition': 'definition',
 *     'Translation': 'translation',
 *     'Category': 'category'
 *   }
 * });
 *
 * // Import CSV file
 * const result = await glossaryImporter.importFile(csvFile);
 *
 * // Or get preview before importing
 * const preview = await glossaryImporter.getPreview(csvFile);
 * ```
 */

import { useImporter, type ImporterConfig, type ImportRowResult } from '@/modules/core';
import { parseCSVFile } from '@/utils/csvParser';
import { useGlossaryStore } from '../store';
import { glossaryAPI } from '../api';
import type { GlossaryTerm } from '../types';

type GlossaryCSVField = keyof Omit<GlossaryTerm, 'id' | 'frequency' | 'seriesId' | 'chapterId' | 'chapterIds' | 'isUserDefined'>;

/**
 * Glossary import configuration
 */
export interface GlossaryImporterConfig {
  /**
   * Series ID for imported terms (required)
   */
  seriesId: string;
  
  /**
   * Chapter ID for imported terms (optional)
   */
  chapterId?: string;
  
  /**
   * Mapping from CSV column headers to glossary term fields
   * Supported fields: term, definition, translation, category
   * Headers are matched case‑insensitively (e.g., "Term", "term", "TERM" all map to 'term')
   * Default mapping includes common variations: Term/term, Definition/definition, Translation/translation, Category/category/type/tag
   * @default { 'Term': 'term', 'term': 'term', 'Definition': 'definition', 'definition': 'definition', 'Translation': 'translation', 'translation': 'translation', 'Category': 'category', 'category': 'category', 'type': 'category', 'Type': 'category', 'tag': 'category', 'Tag': 'category', 'meaning': 'definition', 'Meaning': 'definition' }
   */
  columnMapping?: Record<string, keyof Omit<GlossaryTerm, 'id' | 'frequency' | 'seriesId' | 'chapterId' | 'chapterIds' | 'isUserDefined'>>;
  
  /**
   * Default category for terms without category column
   * @default 'General'
   */
  defaultCategory?: string;
  
  /**
   * Whether to mark imported terms as user-defined
   * @default true
   */
  markAsUserDefined?: boolean;
  
  /**
   * Whether to skip terms that already exist in the series
   * @default true
   */
  skipDuplicates?: boolean;
  
  /**
   * Batch size for import operations
   * @default 10
   */
  batchSize?: number;
  
  /**
   * CSV parsing options
   */
  csvOptions?: {
    header?: boolean;
    delimiter?: string;
    skipEmptyLines?: boolean;
  };
}

/**
 * Default column mapping for glossary terms
 * Supports multiple header variations (case-insensitive)
 */
const DEFAULT_COLUMN_MAPPING: Record<string, GlossaryCSVField> = {
  // Primary capitalized headers
  'Term': 'term',
  'Translation': 'translation',
  'Type': 'category',
  'Definition': 'definition',
};

/**
 * Default glossary term values
 */
const getDefaultValues = (config: GlossaryImporterConfig): Partial<GlossaryTerm> => ({
  seriesId: config.seriesId,
  chapterId: config.chapterId,
  chapterIds: config.chapterId ? [config.chapterId] : undefined,
  isUserDefined: config.markAsUserDefined !== false,
  frequency: 0,
  category: config.defaultCategory || 'General',
});

/**
 * Validate glossary term row
 */
const validateGlossaryRow = (
  row: Record<string, string>,
  config: GlossaryImporterConfig,
  store: ReturnType<typeof useGlossaryStore>
): boolean | string => {
  // Check required fields
  const requiredFields = ['term', 'translation'];
  for (const field of requiredFields) {
    const value = row[field];
    if (!value?.trim()) {
      return `Missing required field: ${field}`;
    }
  }
  
  // Check for duplicates if configured
  if (config.skipDuplicates) {
    const termText = row.term.trim().toLowerCase();
    const existingTerm = store.findTermByText(termText);
    if (existingTerm) {
      return `Term already exists: ${row.term}`;
    }
  }
  
  return true;
};

/**
 * Transform CSV row to glossary term
 */
const transformGlossaryRow = (
  row: Record<string, string>,
  config: GlossaryImporterConfig
): Omit<GlossaryTerm, 'id' | 'frequency'> => {
  const defaultValues = getDefaultValues(config);
  
  return {
    term: row.term?.trim() || '',
    definition: row.definition?.trim() || '',
    translation: row.translation?.trim() || '',
    category: row.category?.trim() || defaultValues.category || 'General',
    isUserDefined: defaultValues.isUserDefined ?? true,
    seriesId: config.seriesId,
    chapterId: config.chapterId,
    chapterIds: config.chapterId ? [config.chapterId] : undefined,
  };
};

/**
 * Map CSV row using column mapping with case‑insensitive header matching
 * Only sets fields when a matching header is found
 * Supports headers with leading/trailing whitespace
 */
const mapCSVRow = (
  csvRow: Record<string, string>,
  columnMapping: Record<string, string>
): Record<string, string> => {
  const mapped: Record<string, string> = {};
  const csvHeaders = Object.keys(csvRow);
  
  // Create a normalized map for faster lookup: normalized header -> { originalHeader, value }
  const normalizedMap = new Map<string, { originalHeader: string; value: string }>();
  for (const header of csvHeaders) {
    const normalized = header.trim().toLowerCase();
    // Keep first occurrence if duplicates exist (unlikely)
    if (!normalizedMap.has(normalized)) {
      normalizedMap.set(normalized, { originalHeader: header, value: csvRow[header] });
    }
  }
  
  // Track which fields have already been mapped to prevent overwrites
  const mappedFields = new Set<string>();
  
  for (const [csvHeader, fieldName] of Object.entries(columnMapping)) {
    // Skip if this field already has a value from a previous mapping
    if (mappedFields.has(fieldName)) {
      continue;
    }
    
    const normalizedMappingHeader = csvHeader.trim().toLowerCase();
    
    // Check if normalized header exists
    const matched = normalizedMap.get(normalizedMappingHeader);
    if (matched) {
      mapped[fieldName] = matched.value;
      mappedFields.add(fieldName);
    }
    
    // No matching header → leave field undefined (will use default value)
  }
  
  return mapped;
};

/**
 * Import a glossary term using the store
 */
const importGlossaryTerm = async (
  term: Omit<GlossaryTerm, 'id' | 'frequency'>,
  store: ReturnType<typeof useGlossaryStore>
): Promise<boolean | string> => {
  try {
    const result = await store.addTerm(term);
    return result !== null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Failed to import term';
  }
};

/**
 * Glossary-specific import composable
 */
export function useGlossaryImporter(config: GlossaryImporterConfig) {
  const store = useGlossaryStore();
  
  // Merge column mapping with defaults
  const columnMapping = {
    ...DEFAULT_COLUMN_MAPPING,
    ...config.columnMapping,
  };
  
  // Create importer configuration (without importRow since we handle bulk import separately)
  const importerConfig: ImporterConfig<Record<string, string>, Omit<GlossaryTerm, 'id' | 'frequency'>> = {
    columnMapping,
    defaultValues: getDefaultValues(config),
    validateRow: (row) => validateGlossaryRow(row, config, store),
    transformRow: (row) => transformGlossaryRow(row, config),
    // importRow omitted - we handle bulk import in importGlossaryFile
    batchSize: config.batchSize || 10,
    skipInvalidRows: true,
    stopOnError: false,
    csvOptions: config.csvOptions,
  };
  
  // Create the importer instance
  const importer = useImporter(importerConfig);
  
  /**
   * Import glossary terms from CSV file using bulk API
   */
  const importGlossaryFile = async (file: File) => {
    if (!config.seriesId) {
      throw new Error('Cannot import glossary terms without a series selected');
    }
    
    const startTime = Date.now();
    
    try {
      // Parse CSV
      const parseResult = await parseCSVFile<Record<string, string>>(file, {
        header: true,
        delimiter: ',',
        skipEmptyLines: true,
        ...config.csvOptions,
      });
      
      if (parseResult.errors.length > 0) {
        throw new Error(`CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`);
      }
      
      const rows = parseResult.data;
      if (rows.length === 0) {
        throw new Error('CSV file contains no data rows');
      }
      
      const results: ImportRowResult[] = [];
      const validTerms: Omit<GlossaryTerm, 'id' | 'frequency'>[] = [];
      
      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const csvRow = rows[i];
        
        // Map CSV columns to field names
        const mappedRow = mapCSVRow(csvRow, columnMapping);
        
        // Validate row
        const validationResult = validateGlossaryRow(mappedRow, config, store);
        if (validationResult !== true) {
          results.push({
            row: i + 1,
            success: false,
            error: typeof validationResult === 'string' ? validationResult : 'Validation failed',
          });
          continue;
        }
        
        // Transform row to glossary term
        const term = transformGlossaryRow(mappedRow, config);
        validTerms.push(term);
        results.push({
          row: i + 1,
          success: true,
          data: term,
        });
      }
      
      // If no valid terms, return early
      if (validTerms.length === 0) {
        return {
          totalRows: rows.length,
          successRows: 0,
          validationErrors: results.filter(r => !r.success).length,
          importErrors: 0,
          results,
          duration: Date.now() - startTime,
        };
      }
      
      // Send bulk import request
      const apiResponse = await glossaryAPI.importGlossaryTerms(validTerms);
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Bulk import failed');
      }
      
      const importResponse = apiResponse.data!;
      
      // Map backend errors to row results
      const backendErrorMap = new Map(importResponse.failed.map(f => [f.row - 1, f.error]));
      
      // Update results based on backend response
      let successCount = 0;
      let backendErrorCount = 0;
      let resultIndex = 0;
      
      for (let i = 0; i < results.length; i++) {
        if (!results[i].success) {
          // Already failed validation, keep as validation error
          continue;
        }
        
        if (backendErrorMap.has(i)) {
          // Backend rejected this row
          results[i].success = false;
          results[i].error = backendErrorMap.get(i);
          delete results[i].data;
          backendErrorCount++;
        } else {
          successCount++;
        }
        resultIndex++;
      }
      
      // Refresh store to include newly imported terms
      if (successCount > 0 && config.seriesId) {
        store.loadTerms(config.seriesId, config.chapterId);
      }
      
      return {
        totalRows: rows.length,
        successRows: successCount,
        validationErrors: results.filter(r => !r.success && !backendErrorMap.has(r.row - 1)).length,
        importErrors: backendErrorCount,
        results,
        duration: Date.now() - startTime,
      };
      
    } catch (error) {
      // Return error result
      return {
        totalRows: 0,
        successRows: 0,
        validationErrors: 0,
        importErrors: 1,
        results: [{
          row: 1,
          success: false,
          error: error instanceof Error ? error.message : 'Import failed',
        }],
        duration: Date.now() - startTime,
      };
    }
  };
  
  /**
   * Get preview of glossary terms from CSV file
   */
  const getGlossaryPreview = async (file: File, maxRows: number = 10) => {
    return importer.getPreview(file, maxRows);
  };
  
  /**
   * Check if a term already exists in the series
   */
  const checkTermExists = async (termText: string): Promise<boolean> => {
    return store.termExistsInSeries(termText);
  };
  
  /**
   * Get column mapping suggestions based on CSV headers
   */
  const suggestColumnMapping = async (
    file: File
  ): Promise<Record<string, string>> => {
    const parseResult = await parseCSVFile(file, {
      header: true,
      preview: 1,
    });
    
    if (parseResult.errors.length > 0 || parseResult.data.length === 0) {
      return {};
    }
    
    const headers = parseResult.meta.fields || [];
    const suggestions: Record<string, string> = {};
    
    // Common header patterns
    const patterns = [
      { regex: /term/i, field: 'term' },
      { regex: /definition|meaning/i, field: 'definition' },
      { regex: /translation/i, field: 'translation' },
      { regex: /category|type|tag/i, field: 'category' },
    ];
    
    headers.forEach(header => {
      for (const pattern of patterns) {
        if (pattern.regex.test(header)) {
          suggestions[header] = pattern.field;
          break;
        }
      }
    });
    
    return suggestions;
  };
  
  return {
    // Import state and methods
    ...importer,
    
    // Glossary-specific methods
    importGlossaryFile,
    getGlossaryPreview,
    checkTermExists,
    suggestColumnMapping,
    
    // Configuration
    config,
    columnMapping,
  };
}

/**
 * Create a preconfigured glossary importer
 */
export function createGlossaryImporter(config: GlossaryImporterConfig) {
  return () => useGlossaryImporter(config);
}