/**
 * Editor Module - Public API
 *
 * The Editor module provides chapter editing and management capabilities.
 *
 * Features:
 * - Store: Pinia store for editor state (current chapter, editing modes, unsaved changes)
 * - Components: UI for viewing and editing chapters with multiple layout modes
 * - API: CRUD operations for chapters with automatic mock/real switching
 *
 * Integration Example:
 * ```typescript
 * // In main.ts - register the store
 * import { createPinia } from 'pinia';
 * const pinia = createPinia();
 * app.use(pinia);
 *
 * // In a page/component
 * import { useEditorStore, ChapterEditor } from '@/modules/editor';
 *
 * const editor = useEditorStore();
 * await editor.loadChapter('ch-123');
 * ```
 *
 * Using the ChapterEditor component:
 * ```vue
 * <template>
 *   <ChapterEditor
 *     :chapterId="currentChapterId"
 *     :highlightTermsInText="glossary.highlightTermsInText"
 *     :isHighlightEnabled="glossary.isHighlightEnabled"
 *     @translateAll="handleTranslateAll"
 *     @chapterUpdated="handleChapterUpdate"
 *   />
 * </template>
 * ```
 *
 * API Configuration:
 * - Mock mode: Set useMockAPI = true in @/modules/core/utils/environment.ts
 * - Real mode: Set useMockAPI = false and configure VITE_API_BASE_URL
 * - Editor module handles switching internally via Core's environment utils
 *
 * Module Decoupling:
 * - Editor does NOT directly import Glossary
 * - Glossary integration happens at the app level via props
 * - Editor only depends on Core for infrastructure (API client, environment utils)
 */

// Store
export { useEditorStore } from './store';

// Components
export { default as ChapterEditor } from './components/ChapterEditor.vue';
export { default as ParagraphEditor } from './components/ParagraphEditor.vue';
export { default as TextColumn } from './components/TextColumn.vue';

// API
export { editorAPI } from './api';

// Types
export type {
  Chapter,
  EditorState,
  ParagraphEditState,
  LayoutMode,
  ContentMode,
  ViewPreferences
} from './types';
