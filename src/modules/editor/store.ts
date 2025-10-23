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
  const hasUnsavedChanges = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const shouldInitiateChapterSave = ref(false);

  // History management for undo/redo
  const history = ref<Array<{ 
    type: 'paragraph' | 'full', 
    content: string, 
    translatedContent: string,
    originalParagraphs: string[], 
    translatedParagraphs: string[],
    timestamp: number 
  }>>([]);
  const historyIndex = ref(-1);
  const maxHistorySize = 50;

  // View preferences (persisted to localStorage)
  const layoutMode = ref<LayoutMode>('split');
  const contentMode = ref<ContentMode>('all');

  // Computed
  const editorState = computed<EditorState>(() => ({
    currentChapterId: currentChapterId.value,
    isEditingOriginal: isEditingOriginal.value,
    editingOriginalParagraphs: editingOriginalParagraphs.value,
    editingTranslatedParagraphs: editingTranslatedParagraphs.value,
    hasUnsavedChanges: hasUnsavedChanges.value,
  }));

  // Actions

  /**
   * Load a chapter into the editor
   */
  function loadChapter(chapter: Chapter) {
    clearChapter()
    if (chapter) {
      currentChapter.value = chapter;
      currentChapterId.value = chapter.id;
      hasUnsavedChanges.value = false;
      // Initialize history with the loaded chapter
      addToHistory('full', chapter.content, chapter.translatedContent, chapter.originalParagraphs, chapter.translatedParagraphs);
    }
  }

  /**
   * Add a state to history for undo/redo functionality
   */
  function addToHistory(type: 'paragraph' | 'full', content: string, translatedContent: string, originalParagraphs: string[], translatedParagraphs: string[]) {
    const historyEntry = {
      type,
      content,
      translatedContent,
      originalParagraphs: [...originalParagraphs],
      translatedParagraphs: [...translatedParagraphs],
      timestamp: Date.now()
    };

    // Remove any history after current index
    history.value = history.value.slice(0, historyIndex.value + 1);
    
    // Add new entry
    history.value.push(historyEntry);
    historyIndex.value = history.value.length - 1;

    // Limit history size
    if (history.value.length > maxHistorySize) {
      history.value.shift();
      historyIndex.value--;
    }
  }

  /**
   * Undo the last change
   */
  function undo() {
    if (historyIndex.value > 0 && currentChapter.value) {
      historyIndex.value--;
      const historyEntry = history.value[historyIndex.value];
      
      // Restore both original and translated content
      currentChapter.value.content = historyEntry.content;
      currentChapter.value.translatedContent = historyEntry.translatedContent;
      currentChapter.value.originalParagraphs = [...historyEntry.originalParagraphs];
      currentChapter.value.translatedParagraphs = [...historyEntry.translatedParagraphs];
      
      hasUnsavedChanges.value = true;
    }
  }

  /**
   * Redo the next change
   */
  function redo() {
    if (historyIndex.value < history.value.length - 1 && currentChapter.value) {
      historyIndex.value++;
      const historyEntry = history.value[historyIndex.value];
      
      // Restore both original and translated content
      currentChapter.value.content = historyEntry.content;
      currentChapter.value.translatedContent = historyEntry.translatedContent;
      currentChapter.value.originalParagraphs = [...historyEntry.originalParagraphs];
      currentChapter.value.translatedParagraphs = [...historyEntry.translatedParagraphs];
      
      hasUnsavedChanges.value = true;
    }
  }

  /**
   * Check if undo is available
   */
  const canUndo = computed(() => {
    return historyIndex.value > 0;
  });

  /**
   * Check if redo is available
   */
  const canRedo = computed(() => {
    return historyIndex.value < history.value.length - 1;
  });

  /**
   * Update the current chapter (local state only)
   */
  function updateLocalChapter(updates: Partial<Chapter>) {
    if (currentChapter.value) {
      currentChapter.value = { ...currentChapter.value, ...updates };
      hasUnsavedChanges.value = true;
    }
  }

  /**
   * Save chapter changes to the API
   */
  async function saveChapter() {
    if (!currentChapter.value) return;
    shouldInitiateChapterSave.value = true;
    hasUnsavedChanges.value = false;
  }

  /**
   * Toggle editing mode for the entire original text
   */
  function toggleEditingOriginal() {
    isEditingOriginal.value = !isEditingOriginal.value;
    if (!isEditingOriginal.value) {
      saveChapter();
    }
  }

  /**
   * Toggle editing mode for the entire translated text
   */
  function toggleEditingTranslated() {
    isEditingTranslated.value = !isEditingTranslated.value;
    if (!isEditingTranslated.value) {
      saveChapter();
    }
  }

  /**
   * Start editing a specific paragraph
   */
  function startEditingParagraph(index: number, type: 'original' | 'translated') {
    if (type === 'original') {
      editingOriginalParagraphs.value.add(index);
    } else {
      editingTranslatedParagraphs.value.add(index);
    }
  }

  /**
   * Stop editing a specific paragraph
   */
  function stopEditingParagraph(index: number, type: 'original' | 'translated') {
    if (type === 'original') {
      editingOriginalParagraphs.value.delete(index);
    } else {
      editingTranslatedParagraphs.value.delete(index);
    }
  }

  /**
   * Save a paragraph's content
   */
  async function saveParagraph(index: number, content: string, type: 'original' | 'translated') {
    if (!currentChapter.value) return;

    if (type === 'original') {
      currentChapter.value.originalParagraphs[index] = content;
      currentChapter.value.content = currentChapter.value.originalParagraphs.join('\n\n');
    } else {
      currentChapter.value.translatedParagraphs[index] = content;
      currentChapter.value.translatedContent = currentChapter.value.translatedParagraphs.join('\n\n');
    }

    // Add to history after making changes
    addToHistory('paragraph', currentChapter.value.content, currentChapter.value.translatedContent, currentChapter.value.originalParagraphs, currentChapter.value.translatedParagraphs);

    hasUnsavedChanges.value = true;
    stopEditingParagraph(index, type);
    await saveChapter();
  }

  /**
   * Add a new paragraph at the specified index
   */
  function addParagraph(index: number, type: 'original' | 'translated', content: string = '') {
    if (!currentChapter.value) return;

    if (type === 'original') {
      currentChapter.value.originalParagraphs.splice(index, 0, content);
      currentChapter.value.content = currentChapter.value.originalParagraphs.join('\n\n');
    } else {
      currentChapter.value.translatedParagraphs.splice(index, 0, content);
      currentChapter.value.translatedContent = currentChapter.value.translatedParagraphs.join('\n\n');
    }

    // Add to history after making changes
    addToHistory('paragraph', currentChapter.value.content, currentChapter.value.translatedContent, currentChapter.value.originalParagraphs, currentChapter.value.translatedParagraphs);

    hasUnsavedChanges.value = true;
  }

  /**
   * Delete a paragraph at the specified index
   */
  function deleteParagraph(index: number, type: 'original' | 'translated') {
    if (!currentChapter.value) return;

    if (type === 'original') {
      currentChapter.value.originalParagraphs.splice(index, 1);
      currentChapter.value.content = currentChapter.value.originalParagraphs.join('\n\n');
    } else {
      currentChapter.value.translatedParagraphs.splice(index, 1);
      currentChapter.value.translatedContent = currentChapter.value.translatedParagraphs.join('\n\n');
    }

    // Add to history after making changes
    addToHistory('paragraph', currentChapter.value.content, currentChapter.value.translatedContent, currentChapter.value.originalParagraphs, currentChapter.value.translatedParagraphs);

    hasUnsavedChanges.value = true;
  }

  /**
   * Move a paragraph from one index to another
   */
  function moveParagraph(fromIndex: number, toIndex: number, type: 'original' | 'translated') {
    if (!currentChapter.value) return;

    if (type === 'original') {
      const paragraph = currentChapter.value.originalParagraphs.splice(fromIndex, 1)[0];
      currentChapter.value.originalParagraphs.splice(toIndex, 0, paragraph);
      currentChapter.value.content = currentChapter.value.originalParagraphs.join('\n\n');
    } else {
      const paragraph = currentChapter.value.translatedParagraphs.splice(fromIndex, 1)[0];
      currentChapter.value.translatedParagraphs.splice(toIndex, 0, paragraph);
      currentChapter.value.translatedContent = currentChapter.value.translatedParagraphs.join('\n\n');
    }

    // Add to history after making changes
    addToHistory('paragraph', currentChapter.value.content, currentChapter.value.translatedContent, currentChapter.value.originalParagraphs, currentChapter.value.translatedParagraphs);

    hasUnsavedChanges.value = true;
  }

  /**
   * Cancel editing a paragraph
   */
  function cancelParagraphEdit(index: number, type: 'original' | 'translated') {
    stopEditingParagraph(index, type);
  }

  /**
   * Update full original text (for full-text editing mode)
   */
  async function saveFullOriginalText(text: string) {
    if (!currentChapter.value) return;
    
    const normalized = text
      .replace(/<br\s*\/?>(\s*)/gi, '\n\n');

    const paragraphs = normalized
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    currentChapter.value.content = normalized;
    currentChapter.value.originalParagraphs = paragraphs;

    // Add to history after making changes
    addToHistory('full', currentChapter.value.content, currentChapter.value.translatedContent, currentChapter.value.originalParagraphs, currentChapter.value.translatedParagraphs);

    hasUnsavedChanges.value = true;
    await saveChapter();
  }

  /**
   * Update full translated text (for full-text editing mode)
   */
  async function saveFullTranslatedText(text: string) {
    if (!currentChapter.value) return;

    const normalized = text
      .replace(/<br\s*\/?>(\s*)/gi, '\n\n');

    const paragraphs = normalized
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    currentChapter.value.translatedContent = normalized;
    currentChapter.value.translatedParagraphs = paragraphs;

    // Add to history after making changes
    addToHistory('full', currentChapter.value.content, currentChapter.value.translatedContent, currentChapter.value.originalParagraphs, currentChapter.value.translatedParagraphs);

    hasUnsavedChanges.value = true;
    await saveChapter();
  }

  /**
   * Toggle layout mode (split vs full)
   */
  function toggleLayoutMode() {
    layoutMode.value = layoutMode.value === 'split' ? 'full' : 'split';
    localStorage.setItem('editor:layoutMode', layoutMode.value);
  }

  /**
   * Toggle content mode (all vs translated only)
   */
  function toggleContentMode() {
    contentMode.value = contentMode.value === 'all' ? 'translated' : 'all';
    localStorage.setItem('editor:contentMode', contentMode.value);
  }

  /**
   * Load view preferences from localStorage
   */
  function loadViewPreferences() {
    const savedLayout = localStorage.getItem('editor:layoutMode') as LayoutMode;
    const savedContent = localStorage.getItem('editor:contentMode') as ContentMode;

    if (savedLayout) layoutMode.value = savedLayout;
    if (savedContent) contentMode.value = savedContent;
  }

  /**
   * Clear the current chapter from the editor
   */
  function clearChapter() {
    currentChapter.value = null;
    currentChapterId.value = null;
    hasUnsavedChanges.value = false;
    isEditingOriginal.value = false;
    isEditingTranslated.value = false;
    editingOriginalParagraphs.value.clear();
    editingTranslatedParagraphs.value.clear();
    error.value = null;
    history.value = [];
    historyIndex.value = -1;
  }

  // Initialize view preferences
  loadViewPreferences();

  return {
    // State
    currentChapter: computed(() => currentChapter.value),
    currentChapterId: computed(() => currentChapterId.value),
    isEditingOriginal: computed(() => isEditingOriginal.value),
    isEditingTranslated: computed(() => isEditingTranslated.value),
    editingOriginalParagraphs: computed(() => editingOriginalParagraphs.value),
    editingTranslatedParagraphs: computed(() => editingTranslatedParagraphs.value),
    hasUnsavedChanges: computed(() => hasUnsavedChanges.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    layoutMode: computed(() => layoutMode.value),
    contentMode: computed(() => contentMode.value),
    editorState,

    // Actions
    loadChapter,
    updateLocalChapter,
    saveChapter,
    toggleEditingOriginal,
    toggleEditingTranslated,
    startEditingParagraph,
    stopEditingParagraph,
    saveParagraph,
    cancelParagraphEdit,
    saveFullOriginalText,
    saveFullTranslatedText,
    toggleLayoutMode,
    toggleContentMode,
    loadViewPreferences,
    clearChapter,
    
    // History management
    undo,
    redo,
    canUndo,
    canRedo,
    
    // Paragraph management
    addParagraph,
    deleteParagraph,
    moveParagraph,
  };
});
