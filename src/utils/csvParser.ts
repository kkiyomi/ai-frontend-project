/**
 * CSV Parser Utility
 * 
 * Wrapper around papaparse for consistent CSV parsing with TypeScript support.
 * Provides typed parsing with configurable options and error handling.
 */

import Papa, { type ParseConfig, type ParseLocalConfig, type ParseError, type ParseMeta, type ParseResult } from 'papaparse';

/**
 * CSV parsing options
 */
export interface CSVParseOptions {
  /**
   * Whether the CSV has a header row
   * @default true
   */
  header?: boolean;
  
  /**
   * Column delimiter
   * @default ','
   */
  delimiter?: string;
  
  /**
   * Skip empty lines
   * @default true
   */
  skipEmptyLines?: boolean | 'greedy';

  /**
   * Maximum number of rows to parse (0 for all rows)
   * @default 0
   */
  preview?: number;
  
  /**
   * Transform function for each row
   */
  transform?: (value: string, field: string | number) => any;
  
  /**
   * Custom column names (used when header is false)
   */
  columns?: string[];
  
  /**
   * Whether to trim whitespace from values
   * @default true
   */
  trim?: boolean;
}

/**
 * CSV parsing result
 */
export interface CSVParseResult<T = Record<string, string>> {
  /** Parsed data rows */
  data: T[];
  /** Parsing errors */
  errors: ParseError[];
  /** CSV metadata */
  meta: ParseMeta;
}

/**
 * Parse CSV text or file
 * 
 * @param input CSV text string or File object
 * @param options Parsing options
 * @returns Promise with parsed results
 */
export async function parseCSV<T = Record<string, string>>(
  input: string | File,
  options: CSVParseOptions = {}
): Promise<CSVParseResult<T>> {
  const {
    header = true,
    delimiter = ',',
    skipEmptyLines = true,
    preview = 0,
    transform,
    columns,
    trim = true,
  } = options;

  // Strip BOM (Byte Order Mark) if present in string input
  if (typeof input === 'string' && input.charCodeAt(0) === 0xFEFF) {
    input = input.slice(1);
  }
  
  return new Promise((resolve, reject) => {
    const config: any = {
      header,
      delimiter,
      skipEmptyLines,
      ...(preview > 0 ? { preview } : {}),
      transform: transform || ((value: string) => trim ? value.trim() : value),
      complete: (result: ParseResult<T>) => {
        resolve({
          data: result.data,
          errors: result.errors,
          meta: result.meta,
        });
      },
      error: (error: Error) => {
        reject(error);
      },
    };

    // Set column names if provided (for files without headers)
    if (columns && !header) {
      config.transformHeader = (_: string, index: number) => columns[index] || `column_${index}`;
    }

    // Parse based on input type
    if (typeof input === 'string') {
      Papa.parse(input, config);
    } else {
      Papa.parse(input, config);
    }
  });
}

/**
 * Parse CSV file asynchronously (convenience wrapper)
 */
export async function parseCSVFile<T = Record<string, string>>(
  file: File,
  options: CSVParseOptions = {}
): Promise<CSVParseResult<T>> {
  return parseCSV(file, options);
}

/**
 * Parse CSV text asynchronously (convenience wrapper)
 */
export async function parseCSVText<T = Record<string, string>>(
  text: string,
  options: CSVParseOptions = {}
): Promise<CSVParseResult<T>> {
  return parseCSV(text, options);
}

/**
 * Validate CSV structure
 * 
 * @param csvText CSV text to validate
 * @param requiredColumns Array of required column names (if header is true)
 * @returns Validation result with errors if any
 */
export function validateCSV(
  csvText: string,
  requiredColumns: string[] = []
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const result = Papa.parse(csvText, {
      preview: 2,
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      errors.push(...result.errors.map((e: ParseError) => `${e.type}: ${e.message} (row ${e.row})`));
    }

    // Check required columns if we have headers
    if (requiredColumns.length > 0 && result.meta.fields) {
      const missingColumns = requiredColumns.filter(
        col => !result.meta.fields!.includes(col)
      );
      if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      }
    }

    // Check if we have data
    if (result.data.length === 0) {
      errors.push('CSV file is empty or contains no data rows');
    }
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Convert array of objects to CSV text
 * 
 * @param data Array of objects to convert
 * @param options Parsing options
 * @returns CSV text string
 */
export function toCSV<T extends Record<string, any>>(
  data: T[],
  options: Papa.UnparseConfig = {}
): string {
  return Papa.unparse(data, {
    header: true,
    delimiter: ',',
    ...options,
  });
}