// Local storage utilities for persisting user preferences

const STORAGE_KEYS = {
  LAYOUT_MODE: 'translation-layout-mode',
  CONTENT_MODE: 'translation-content-mode',
  SIDEBAR_EXPANDED: 'sidebar-expanded',
  GLOSSARY_VISIBLE: 'glossary-visible',
} as const;

export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored) as T;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}

// Specific functions for translation view modes
export function saveLayoutMode(mode: 'split' | 'full'): void {
  saveToLocalStorage(STORAGE_KEYS.LAYOUT_MODE, mode);
}

export function loadLayoutMode(): 'split' | 'full' {
  return loadFromLocalStorage(STORAGE_KEYS.LAYOUT_MODE, 'split');
}

export function saveContentMode(mode: 'all' | 'translated'): void {
  saveToLocalStorage(STORAGE_KEYS.CONTENT_MODE, mode);
}

export function loadContentMode(): 'all' | 'translated' {
  return loadFromLocalStorage(STORAGE_KEYS.CONTENT_MODE, 'all');
}

export function saveSidebarExpanded(expanded: boolean): void {
  saveToLocalStorage(STORAGE_KEYS.SIDEBAR_EXPANDED, expanded);
}

export function loadSidebarExpanded(): boolean {
  return loadFromLocalStorage(STORAGE_KEYS.SIDEBAR_EXPANDED, false);
}

export function saveGlossaryVisible(visible: boolean): void {
  saveToLocalStorage(STORAGE_KEYS.GLOSSARY_VISIBLE, visible);
}

export function loadGlossaryVisible(): boolean {
  return loadFromLocalStorage(STORAGE_KEYS.GLOSSARY_VISIBLE, false);
}