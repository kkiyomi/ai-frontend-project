/**
 * Chapters Module
 *
 * Self-contained module for managing chapters within series.
 *
 * Features:
 * - Chapter CRUD operations
 * - Content and translation management
 * - Paragraph splitting and processing
 * - File upload support
 *
 * Usage:
 * ```typescript
 * import { useChaptersStore, type Chapter } from '@/modules/chapters';
 *
 * const chaptersStore = useChaptersStore();
 * await chaptersStore.loadChapters('series-id');
 * ```
 */

export { useChaptersStore } from './store';
export { chapterAPI } from './api';

export { default as BulkChapterUpload } from './components/BulkChapterUpload.vue';

export type {
  Chapter,
  ChapterCreateInput,
  ChapterUpdateInput
} from './types';
