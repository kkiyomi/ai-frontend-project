// Utility functions for chapter operations
import type { Chapter, Series } from '../types';

export function getSeriesTranslationProgress(series: Series): number {
  if (!series.chapters || series.chapters.length === 0) return 0;

  const totalChapters = series.chapters.length;
  const translatedChapters = series.chapters.filter(ch => ch.isTranslated).length;

  return Math.round((translatedChapters / totalChapters) * 100);
}

export function getChapterTranslationProgress(chapter: Chapter): number {
  if (chapter.originalParagraphs.length === 0) return 0;
  const translatedCount = chapter.translatedParagraphs.filter(p => p.trim()).length;
  return Math.round((translatedCount / chapter.originalParagraphs.length) * 100);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function getFileIcon(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'docx':
    case 'doc':
      return '📝';
    case 'txt':
      return '📋';
    default:
      return '📄';
  }
}