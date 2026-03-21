/**
 * Editor Module - Pinia Store
 *
 * Manages editor state including current chapter, editing modes, and unsaved changes.
 *
 * Usage Example:
 * ```typescript
 * import { useEditorStore } from '@/modules/editor';
 *
 * const editor = useEditorStore();
 * editor.loadChapter(chapter);
 * editor.startEditingParagraph(0, 'original');
 * await editor.saveParagraph(0, 'Updated content', 'original');
 * ```
 *
 * Integration in pages:
 * ```vue
 * <script setup>
 * import { useEditorStore } from '@/modules/editor';
 *
 * const editor = useEditorStore();
 *
 * onMounted(() => {
 *   editor.loadChapter(route.params.chapter);
 * });
 * </script>
 * ```
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Chapter, EditorState, LayoutMode, ContentMode } from './types';

export const useEditorStore = defineStore('editor', () => {
  // State
  const currentChapter = ref<Chapter | null>(null);
  const currentChapterId = ref<string | null>(null);

  const isEditingOriginal = ref(false);
  const isEditingTranslated = ref(false);
  const editingOriginalParagraphs = ref<Set<number>>(new Set());
  const editingTranslatedParagraphs = ref<Set<number>>(new Set());

  const dirtyFields = ref<Set<'content' | 'translatedContent'>>(new Set());
  const hasUnsavedChanges = computed(() => dirtyFields.value.size > 0);
  const dirtyFields_ = computed(() => Array.from(dirtyFields.value));

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const shouldInitiateChapterSave = ref(false);
  const isSaving = ref(false);

  // View preferences (persisted to localStorage)
  const layoutMode = ref<LayoutMode>('split');
  const contentMode = ref<ContentMode>('all');

  // ─── History ──────────────────────────────────────────────────────────────

  type HistoryEntry = {
    type: 'paragraph' | 'full';
    content: string;
    translatedContent: string;
    originalParagraphs: string[];
    translatedParagraphs: string[];
    timestamp: number;
  };

  const history = ref<HistoryEntry[]>([]);
  const historyIndex = ref(-1);
  const MAX_HISTORY = 50;

  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);

  // ─── Computed ─────────────────────────────────────────────────────────────

  const editorState = computed<EditorState>(() => ({
    currentChapterId: currentChapterId.value,
    isEditingOriginal: isEditingOriginal.value,
    editingOriginalParagraphs: editingOriginalParagraphs.value,
    editingTranslatedParagraphs: editingTranslatedParagraphs.value,
    hasUnsavedChanges: hasUnsavedChanges.value,
  }));

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /** Returns the paragraph array for the given type, or null if no chapter loaded. */
  function getParagraphs(type: 'original' | 'translated'): string[] | null {
    if (!currentChapter.value) return null;
    return type === 'original'
      ? currentChapter.value.originalParagraphs
      : currentChapter.value.translatedParagraphs;
  }

  /** Rebuilds the full-text content string from paragraph array. */
  function rebuildContent(type: 'original' | 'translated'): void {
    const ch = currentChapter.value;
    if (!ch) return;

    if (type === 'original') {
      ch.content = ch.originalParagraphs.join('\n\n');
    } else {
      ch.translatedContent = ch.translatedParagraphs.join('\n\n');
    }
  }

  /** Pushes a snapshot onto the undo/redo history stack. */
  function addToHistory(
    type: 'paragraph' | 'full',
    content: string,
    translatedContent: string,
    originalParagraphs: string[],
    translatedParagraphs: string[],
  ) {
    history.value = history.value.slice(0, historyIndex.value + 1);
    history.value.push({
      type,
      content,
      translatedContent,
      originalParagraphs: [...originalParagraphs],
      translatedParagraphs: [...translatedParagraphs],
      timestamp: Date.now(),
    });
    historyIndex.value = history.value.length - 1;

    if (history.value.length > MAX_HISTORY) {
      history.value.shift();
      historyIndex.value--;
    }
  }

  /** Records a change: snapshots history and marks the field dirty. */
  function recordChange(
    changeType: 'paragraph' | 'full',
    field: 'content' | 'translatedContent',
  ): void {
    const ch = currentChapter.value;
    if (!ch) return;
    addToHistory(changeType, ch.content, ch.translatedContent, ch.originalParagraphs, ch.translatedParagraphs);
    dirtyFields.value.add(field);
  }

  /** Shared implementation for undo/redo — step = -1 or +1. */
  function applyHistory(step: -1 | 1): void {
    const ch = currentChapter.value;
    if (!ch) return;
    const next = historyIndex.value + step;
    if (next < 0 || next >= history.value.length) return;

    historyIndex.value = next;
    const entry = history.value[next];
    ch.content = entry.content;
    ch.translatedContent = entry.translatedContent;
    ch.originalParagraphs = [...entry.originalParagraphs];
    ch.translatedParagraphs = [...entry.translatedParagraphs];
    dirtyFields.value.add('content');
    dirtyFields.value.add('translatedContent');
  }

  /** Add/remove a paragraph index from the active editing set. */
  function setEditingParagraph(
    index: number,
    type: 'original' | 'translated',
    active: boolean,
  ): void {
    const set = type === 'original' ? editingOriginalParagraphs.value : editingTranslatedParagraphs.value;
    active ? set.add(index) : set.delete(index);
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  /** Load a chapter into the editor. */
  function loadChapter(chapter: Chapter) {
    clearChapter();
    if (chapter) {
      currentChapter.value = chapter;
      currentChapterId.value = chapter.id;
      addToHistory('full', chapter.content, chapter.translatedContent, chapter.originalParagraphs, chapter.translatedParagraphs);
    }
  }

  /** Update chapter in local state only (no API call). */
  function updateLocalChapter(updates: Partial<Chapter>) {
    const ch = currentChapter.value;
    if (!ch) return;
    currentChapter.value = { ...ch, ...updates };
    if (updates.content !== undefined) dirtyFields.value.add('content');
    if (updates.translatedContent !== undefined) dirtyFields.value.add('translatedContent');
  }

  /** Signal that a chapter save should be initiated. */
  function saveChapter() {
    if (currentChapter.value) shouldInitiateChapterSave.value = true;
  }

  /** Reset the save-initiation flag after a successful save. */
  function resetSaveFlag() {
    shouldInitiateChapterSave.value = false;
  }

  function toggleEditingOriginal() {
    isEditingOriginal.value = !isEditingOriginal.value;
    if (!isEditingOriginal.value) saveChapter();
  }

  function toggleEditingTranslated() {
    isEditingTranslated.value = !isEditingTranslated.value;
    if (!isEditingTranslated.value) saveChapter();
  }

  function startEditingParagraph(index: number, type: 'original' | 'translated') {
    setEditingParagraph(index, type, true);
  }

  function stopEditingParagraph(index: number, type: 'original' | 'translated') {
    setEditingParagraph(index, type, false);
  }

  function cancelParagraphEdit(index: number, type: 'original' | 'translated') {
    stopEditingParagraph(index, type);
  }

  function saveParagraph(index: number, content: string, type: 'original' | 'translated') {
    if (!currentChapter.value) return;

    // If there are already pending changes, just flush and save
    if (hasUnsavedChanges.value) {
      rebuildContent(type);
      stopEditingParagraph(index, type);
      saveChapter();
      return;
    }

    const paragraphs = getParagraphs(type)!;
    const contentParagraphs = content.split('\n\n').map(p => p.trim()).filter(Boolean);

    if (contentParagraphs.length === 0) {
      stopEditingParagraph(index, type);
      return;
    }

    if (contentParagraphs.length === 1) {
      if (paragraphs[index].trim() === contentParagraphs[0]) {
        stopEditingParagraph(index, type);
        return;
      }
      paragraphs[index] = contentParagraphs[0];
    } else {
      paragraphs[index] = contentParagraphs[0];
      paragraphs.splice(index + 1, 0, ...contentParagraphs.slice(1));
    }

    rebuildContent(type);
    recordChange('paragraph', type === 'original' ? 'content' : 'translatedContent');
    stopEditingParagraph(index, type);
    saveChapter();
  }

  function addParagraph(index: number, type: 'original' | 'translated', content = '') {
    const paragraphs = getParagraphs(type);
    if (!paragraphs) return;
    paragraphs.splice(index, 0, content);
    rebuildContent(type);
    startEditingParagraph(index, type);
  }

  function deleteParagraph(index: number, type: 'original' | 'translated') {
    const paragraphs = getParagraphs(type);
    if (!paragraphs) return;

    const paragraph = paragraphs[index];
    if (paragraph === undefined) return;

    if (paragraph.trim().length === 0) {
      paragraphs.splice(index, 1);
      rebuildContent(type);
      return;
    }

    paragraphs.splice(index, 1);
    rebuildContent(type);
    recordChange('paragraph', type === 'original' ? 'content' : 'translatedContent');
    saveChapter();
  }

  function moveParagraph(fromIndex: number, toIndex: number, type: 'original' | 'translated') {
    const paragraphs = getParagraphs(type);
    if (!paragraphs) return;
    const [paragraph] = paragraphs.splice(fromIndex, 1);
    paragraphs.splice(toIndex, 0, paragraph);
    rebuildContent(type);
    recordChange('paragraph', type === 'original' ? 'content' : 'translatedContent');
    saveChapter();
  }

  function undo() { applyHistory(-1); }
  function redo() { applyHistory(1); }

  function toggleLayoutMode() {
    layoutMode.value = layoutMode.value === 'split' ? 'full' : 'split';
    localStorage.setItem('editor:layoutMode', layoutMode.value);
  }

  function toggleContentMode() {
    contentMode.value = contentMode.value === 'all' ? 'translated' : 'all';
    localStorage.setItem('editor:contentMode', contentMode.value);
  }

  function loadViewPreferences() {
    const savedLayout = localStorage.getItem('editor:layoutMode') as LayoutMode;
    const savedContent = localStorage.getItem('editor:contentMode') as ContentMode;

    if (savedLayout) layoutMode.value = savedLayout;
    if (savedContent) contentMode.value = savedContent;
  }

  function clearChapter() {
    currentChapter.value = null;
    currentChapterId.value = null;
    dirtyFields.value.clear();
    isEditingOriginal.value = false;
    isEditingTranslated.value = false;
    editingOriginalParagraphs.value.clear();
    editingTranslatedParagraphs.value.clear();
    error.value = null;
    history.value = [];
    historyIndex.value = -1;
    isSaving.value = false;
  }

  function markFieldsSaved(fields: Array<'content' | 'translatedContent'>) {
    fields.forEach(field => dirtyFields.value.delete(field));
    shouldInitiateChapterSave.value = false;
  }

  function markSaveFailed() {
    shouldInitiateChapterSave.value = false;
  }

  function cancelPendingSave() {
    isSaving.value = false;
  }

  function setSaving(value: boolean) {
    isSaving.value = value;
  }

  // Initialize view preferences
  loadViewPreferences();

  return {
    // State (refs exposed directly — no need to re-wrap in computed)
    currentChapter,
    currentChapterId,
    isEditingOriginal,
    isEditingTranslated,
    editingOriginalParagraphs,
    editingTranslatedParagraphs,
    hasUnsavedChanges,
    dirtyFields: dirtyFields_,
    isSaving,
    shouldInitiateChapterSave,
    isLoading,
    error,
    layoutMode,
    contentMode,
    editorState,

    // History
    canUndo,
    canRedo,
    undo,
    redo,

    // Chapter lifecycle
    loadChapter,
    clearChapter,
    updateLocalChapter,
    saveChapter,
    resetSaveFlag,
    markFieldsSaved,
    markSaveFailed,
    setSaving,
    cancelPendingSave,

    // Editing modes
    toggleEditingOriginal,
    toggleEditingTranslated,

    // Paragraph editing
    startEditingParagraph,
    stopEditingParagraph,
    cancelParagraphEdit,
    saveParagraph,
    addParagraph,
    deleteParagraph,
    moveParagraph,

    // View preferences
    toggleLayoutMode,
    toggleContentMode,
    loadViewPreferences,
  };
});