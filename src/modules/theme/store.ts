/**
 * Theme Module - Pinia Store
 *
 * Manages theme state and appearance preferences.
 *
 * Usage Example:
 * ```typescript
 * import { useThemeStore } from '@/modules/theme';
 *
 * const theme = useThemeStore();
 * theme.setTheme('dark');
 * theme.loadTheme(); // Load saved theme on app startup
 * ```
 *
 * Integration in main app:
 * ```typescript
 * // In main.ts or App.vue
 * import { useThemeStore } from '@/modules/theme';
 * 
 * const themeStore = useThemeStore();
 * themeStore.loadTheme();
 * ```
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ThemeState, DaisyUITheme } from './types';
import { DAISYUI_THEMES } from './types';

export const useThemeStore = defineStore('theme', () => {
  // State
  const defaultTheme = ref<DaisyUITheme>('am-light');
  const currentTheme = ref<DaisyUITheme>('am-light');
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Available themes (readonly)
  const availableThemes = ref<DaisyUITheme[]>([...DAISYUI_THEMES]);

  // Computed
  const themeState = computed<ThemeState>(() => ({
    currentTheme: currentTheme.value,
    availableThemes: availableThemes.value,
    isLoading: isLoading.value,
    error: error.value,
  }));

  // Private helper to apply theme to document
  function applyThemeToDocument(theme: DaisyUITheme) {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  // Actions
  function setTheme(theme: DaisyUITheme) {
    try {
      isLoading.value = true;
      
      // Validate theme is available
      if (!availableThemes.value.includes(theme)) {
        throw new Error(`Theme "${theme}" is not available`);
      }

      // Update state
      currentTheme.value = theme;
      
      // Apply to document
      applyThemeToDocument(theme);
      
      // Persist to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('appearance:theme', theme);
      }
      
      error.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to set theme';
      console.error('Theme setting error:', err);
    } finally {
      isLoading.value = false;
    }
  }

  function loadTheme() {
    // Skip if not in browser environment
    if (typeof localStorage === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      isLoading.value = true;
      
      // Load from localStorage
      const savedTheme = localStorage.getItem('appearance:theme');
      
      // Validate saved theme
      if (savedTheme && availableThemes.value.includes(savedTheme as DaisyUITheme)) {
        setTheme(savedTheme as DaisyUITheme);
      } else {
        // Use default theme if no valid saved theme
        applyThemeToDocument(defaultTheme.value);
        currentTheme.value = defaultTheme.value;
      }
      
      error.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load theme';
      console.error('Theme loading error:', err);
    } finally {
      isLoading.value = false;
    }
  }

  function resetTheme() {
    setTheme(defaultTheme.value);
  }

  // Initialize theme on store creation
  loadTheme();

  return {
    // State (refs exposed directly)
    defaultTheme,
    currentTheme,
    availableThemes,
    isLoading,
    error,

    // Computed
    themeState,

    // Actions
    setTheme,
    loadTheme,
    resetTheme,
  };
});