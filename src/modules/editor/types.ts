/**
 * Editor Module - Type Definitions
 *
 * Defines all types for chapter editing functionality
 */

export interface Chapter {
  id: string;
  title: string;
  content: string;
  translatedContent: string;
  originalParagraphs: string[];
  translatedParagraphs: string[];
  seriesId: string;
  isTranslated?: boolean;
}

export interface EditorState {
  currentChapterId: string | null;
  isEditingOriginal: boolean;
  editingOriginalParagraphs: Set<number>;
  editingTranslatedParagraphs: Set<number>;
  hasUnsavedChanges: boolean;
}

export interface ParagraphEditState {
  index: number;
  isEditing: boolean;
  originalContent: string;
}

export type LayoutMode = 'split' | 'full';
export type ContentMode = 'all' | 'translated';

export interface ViewPreferences {
  layoutMode: LayoutMode;
  contentMode: ContentMode;
}
