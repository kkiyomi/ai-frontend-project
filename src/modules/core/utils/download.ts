/**
 * Core Module - Download Utilities
 *
 * Transport layer for downloading export artifacts.
 * Separates browser-specific download logic from pure export logic.
 */

import type { ExportArtifact } from '../types/formatters';

/**
 * Download an export artifact using browser APIs.
 * 
 * @param artifact - The export artifact to download
 * @throws Error if download fails
 */
export function downloadArtifact(artifact: ExportArtifact): void {
  try {
    const blob = artifact.content instanceof Blob 
      ? artifact.content 
      : new Blob([artifact.content], { type: artifact.mimeType });
    
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = artifact.filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (err) {
    throw new Error(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

/**
 * Create a download link for an artifact without triggering download.
 * Useful for creating downloadable links in the UI.
 * 
 * @param artifact - The export artifact
 * @returns Object with URL and cleanup function
 */
export function createDownloadLink(artifact: ExportArtifact): { url: string; cleanup: () => void } {
  const blob = artifact.content instanceof Blob 
    ? artifact.content 
    : new Blob([artifact.content], { type: artifact.mimeType });
  
  const url = URL.createObjectURL(blob);
  
  return {
    url,
    cleanup: () => URL.revokeObjectURL(url),
  };
}

/**
 * Get file size in human-readable format.
 * 
 * @param bytes - File size in bytes
 * @returns Human-readable file size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate artifact before download.
 * 
 * @param artifact - Artifact to validate
 * @throws Error if artifact is invalid
 */
export function validateArtifact(artifact: ExportArtifact): void {
  if (!artifact.content) {
    throw new Error('Export artifact has no content');
  }
  
  if (!artifact.mimeType) {
    throw new Error('Export artifact has no MIME type');
  }
  
  if (!artifact.filename) {
    throw new Error('Export artifact has no filename');
  }
  
  // Validate filename doesn't contain illegal characters
  const illegalChars = /[<>:"/\\|?*]/;
  if (illegalChars.test(artifact.filename)) {
    throw new Error(`Filename contains illegal characters: ${artifact.filename}`);
  }
}