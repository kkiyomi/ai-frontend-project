/**
 * Core Module - Generic Import Composable
 *
 * Provides a reusable base for importing data from CSV files.
 * Uses TypeScript generics to maintain type safety across different data types.
 *
 * Design Decisions:
 * 1. Generic Types: T (raw CSV row) and U (domain object) for flexibility
 * 2. Configuration-based column mapping for CSV header to field mapping
 * 3. Validation, transformation, and import hooks for customization
 * 4. Progress tracking and error reporting
 * 5. Batch processing support for large files
 *
 * Usage Example:
 * ```typescript
 * const importer = useImporter<Record<string, string>, GlossaryTerm>({
 *   columnMapping: {
 *     'Term': 'term',
 *     'Definition': 'definition',
 *     'Translation': 'translation',
 *     'Category': 'category'
 *   },
 *   validateRow: (row) => row.term && row.definition,
 *   transformRow: (row) => ({
 *     id: generateId(),
 *     term: row.term,
 *     definition: row.definition,
 *     translation: row.translation || '',
 *     category: row.category || 'General',
 *     frequency: 0,
 *     isUserDefined: true,
 *     seriesId: 'current-series-id'
 *   }),
 *   importRow: async (term) => glossaryStore.addTerm(term)
 * });
 * 
 * await importer.importFile(csvFile);
 * ```
 */

import { ref, computed } from 'vue';
import { parseCSVFile, type CSVParseResult } from '@/utils/csvParser';

/**
 * Import configuration interface
 */
export interface ImporterConfig<T extends Record<string, string>, U> {
  /**
   * Mapping from CSV column headers to domain object field names
   * Example: { 'CSV Header': 'fieldName' }
   */
  columnMapping: Record<string, keyof U>;
  
  /**
   * Default values for fields not present in CSV
   */
  defaultValues?: Partial<U>;
  
  /**
   * Validate a raw CSV row before transformation
   * Return true if valid, false or error message if invalid
   */
  validateRow?: (row: T) => boolean | string;
  
  /**
   * Transform a validated CSV row into a domain object
   */
  transformRow?: (row: T) => U;
  
  /**
   * Import a transformed domain object
   * Return true if successful, false or error message if failed
   */
  importRow?: (item: U) => Promise<boolean | string>;
  
  /**
   * Batch size for processing (0 for no batching)
   * @default 1
   */
  batchSize?: number;
  
  /**
   * Whether to skip rows with validation errors
   * @default true
   */
  skipInvalidRows?: boolean;
  
  /**
   * Whether to stop import on first error
   * @default false
   */
  stopOnError?: boolean;
  
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
 * Import result for a single row
 */
export interface ImportRowResult {
  /** Row index (1-based) */
  row: number;
  /** Whether import succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Transformed data (if successful) */
  data?: any;
}

/**
 * Import summary result
 */
export interface ImportResult {
  /** Total rows processed */
  totalRows: number;
  /** Successfully imported rows */
  successRows: number;
  /** Rows that failed validation */
  validationErrors: number;
  /** Rows that failed during import */
  importErrors: number;
  /** Detailed results per row */
  results: ImportRowResult[];
  /** Overall import duration in milliseconds */
  duration: number;
}

/**
 * Import progress state
 */
export interface ImportProgress {
  /** Current processing stage */
  stage: 'parsing' | 'validating' | 'transforming' | 'importing' | 'complete';
  /** Current row being processed */
  currentRow: number;
  /** Total rows to process */
  totalRows: number;
  /** Progress percentage (0-100) */
  percentage: number;
}

/**
 * Generic Import Composable
 * 
 * @template T - Raw CSV row type (typically Record<string, string>)
 * @template U - Domain object type
 */
export function useImporter<T extends Record<string, string>, U>(
  config: ImporterConfig<T, U>
) {
  // State
  const isImporting = ref(false);
  const progress = ref<ImportProgress>({
    stage: 'parsing',
    currentRow: 0,
    totalRows: 0,
    percentage: 0,
  });
  const result = ref<ImportResult | null>(null);
  const errors = ref<string[]>([]);
  const abortController = ref<AbortController | null>(null);

  // Computed
  const isActive = computed(() => isImporting.value);
  const hasErrors = computed(() => errors.value.length > 0);
  const lastResult = computed(() => result.value);

  /**
   * Map CSV row using column mapping with case‑insensitive header matching
   * Only sets fields when a matching header is found
   * Supports headers with leading/trailing whitespace
   */
  const mapRow = (csvRow: Record<string, string>): T => {
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
    
    for (const [csvHeader, fieldName] of Object.entries(config.columnMapping)) {
      const fieldKey = fieldName as string;
      
      // Skip if this field already has a value from a previous mapping
      if (mappedFields.has(fieldKey)) {
        continue;
      }
      
      const normalizedMappingHeader = csvHeader.trim().toLowerCase();
      
      // Check if normalized header exists
      const matched = normalizedMap.get(normalizedMappingHeader);
      if (matched) {
        mapped[fieldKey] = matched.value;
        mappedFields.add(fieldKey);
      }
      
      // No matching header → leave field undefined (will use default value)
    }
    
    return mapped as T;
  };

  /**
   * Default validation: check required fields based on column mapping
   */
  const defaultValidateRow = (row: T): boolean | string => {
    const requiredFields = Object.values(config.columnMapping);
    
    for (const field of requiredFields) {
      const fieldKey = field as string;
      if (!row[fieldKey]?.trim()) {
        return `Missing required field: ${fieldKey}`;
      }
    }
    
    return true;
  };

  /**
   * Default transformation: apply column mapping and default values
   * Only overwrites default values when the field exists in the mapped row
   */
  const defaultTransformRow = (row: T): U => {
    const transformed: Record<string, any> = { ...config.defaultValues };
    
    for (const [csvHeader, fieldName] of Object.entries(config.columnMapping)) {
      const fieldKey = fieldName as string;
      if (fieldKey in row) {
        transformed[fieldKey] = row[fieldKey];
      }
    }
    
    return transformed as U;
  };

  /**
   * Update progress state
   */
  const updateProgress = (
    stage: ImportProgress['stage'],
    currentRow: number,
    totalRows: number
  ) => {
    progress.value = {
      stage,
      currentRow,
      totalRows,
      percentage: totalRows > 0 ? Math.round((currentRow / totalRows) * 100) : 0,
    };
  };

  /**
   * Process a single row
   */
  const processRow = async (
    csvRow: Record<string, string>,
    rowIndex: number
  ): Promise<ImportRowResult> => {
    try {
      // Map CSV columns to field names
      const mappedRow = mapRow(csvRow);
      
      // Validate
      const validateRow = config.validateRow || defaultValidateRow;
      const validationResult = validateRow(mappedRow);
      
      if (validationResult !== true) {
        return {
          row: rowIndex + 1,
          success: false,
          error: typeof validationResult === 'string' ? validationResult : 'Validation failed',
        };
      }
      
      // Transform
      const transformRow = config.transformRow || defaultTransformRow;
      const transformedData = transformRow(mappedRow);
      
      // Import (if importRow provided)
      if (config.importRow) {
        const importResult = await config.importRow(transformedData);
        if (importResult !== true) {
          return {
            row: rowIndex + 1,
            success: false,
            error: typeof importResult === 'string' ? importResult : 'Import failed',
          };
        }
      }
      
      return {
        row: rowIndex + 1,
        success: true,
        data: transformedData,
      };
      
    } catch (error) {
      return {
        row: rowIndex + 1,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  /**
   * Process rows in batches
   */
  const processBatch = async (
    rows: Record<string, string>[],
    startIndex: number
  ): Promise<ImportRowResult[]> => {
    const batchSize = config.batchSize || 1;
    const results: ImportRowResult[] = [];
    
    for (let i = 0; i < rows.length; i += batchSize) {
      // Check for abort
      if (abortController.value?.signal.aborted) {
        break;
      }
      
      const batch = rows.slice(i, i + batchSize);
      const batchPromises = batch.map((row, batchIndex) =>
        processRow(row, startIndex + i + batchIndex)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Update progress
      updateProgress('importing', startIndex + i + batch.length, rows.length);
    }
    
    return results;
  };

  /**
   * Main import function
   */
  const importFile = async (file: File): Promise<ImportResult> => {
    // Reset state
    isImporting.value = true;
    progress.value = {
      stage: 'parsing',
      currentRow: 0,
      totalRows: 0,
      percentage: 0,
    };
    result.value = null;
    errors.value = [];
    abortController.value = new AbortController();
    
    const startTime = Date.now();
    const results: ImportRowResult[] = [];
    
    try {
      // Parse CSV
      updateProgress('parsing', 0, 0);
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
      
      // Process rows
      updateProgress('importing', 0, rows.length);
      
      if (config.batchSize && config.batchSize > 1) {
        const batchResults = await processBatch(rows, 0);
        results.push(...batchResults);
      } else {
        for (let i = 0; i < rows.length; i++) {
          if (abortController.value?.signal.aborted) {
            break;
          }
          
          const rowResult = await processRow(rows[i], i);
          results.push(rowResult);
          
          updateProgress('importing', i + 1, rows.length);
          
          // Stop on error if configured
          if (config.stopOnError && !rowResult.success) {
            break;
          }
        }
      }
      
      // Calculate summary
      const successRows = results.filter(r => r.success).length;
      const validationErrors = results.filter(r => !r.success && r.error?.includes('Validation')).length;
      const importErrors = results.filter(r => !r.success && !r.error?.includes('Validation')).length;
      
      const importResult: ImportResult = {
        totalRows: rows.length,
        successRows,
        validationErrors,
        importErrors,
        results,
        duration: Date.now() - startTime,
      };
      
      result.value = importResult;
      updateProgress('complete', rows.length, rows.length);
      
      return importResult;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      errors.value.push(errorMessage);
      
      throw error;
      
    } finally {
      isImporting.value = false;
      abortController.value = null;
    }
  };

  /**
   * Cancel ongoing import
   */
  const cancelImport = () => {
    if (abortController.value) {
      abortController.value.abort();
      isImporting.value = false;
      updateProgress('complete', progress.value.currentRow, progress.value.totalRows);
    }
  };

  /**
   * Reset import state
   */
  const reset = () => {
    isImporting.value = false;
    progress.value = {
      stage: 'parsing',
      currentRow: 0,
      totalRows: 0,
      percentage: 0,
    };
    result.value = null;
    errors.value = [];
    abortController.value = null;
  };

  /**
   * Get preview of mapped data without importing
   */
  const getPreview = async (
    file: File,
    maxRows: number = 10
  ): Promise<{ headers: string[]; rows: T[] }> => {
    const parseResult = await parseCSVFile<Record<string, string>>(file, {
      header: true,
      delimiter: ',',
      skipEmptyLines: true,
      ...config.csvOptions,
    });
    
    if (parseResult.errors.length > 0) {
      throw new Error(`CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`);
    }
    
    const rows = parseResult.data.slice(0, maxRows);
    const mappedRows = rows.map(row => mapRow(row));
    
    return {
      headers: Object.keys(config.columnMapping),
      rows: mappedRows,
    };
  };

  return {
    // State
    isImporting: computed(() => isImporting.value),
    progress: computed(() => progress.value),
    result: computed(() => result.value),
    errors: computed(() => errors.value),
    
    // Computed
    isActive,
    hasErrors,
    lastResult,
    
    // Methods
    importFile,
    cancelImport,
    reset,
    getPreview,
  };
}

/**
 * Create a specialized importer with predefined configuration
 */
export function createImporter<T extends Record<string, string>, U>(
  config: ImporterConfig<T, U>
) {
  return () => useImporter<T, U>(config);
}