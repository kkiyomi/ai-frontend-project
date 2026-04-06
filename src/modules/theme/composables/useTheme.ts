/**
 * Theme Module - Composable
 *
 * Provides reactive theme state and actions for theme switching.
 *
 * Usage Example:
 * ```vue
 * <script setup lang="ts">
 * import { useTheme } from '@/modules/theme';
 *
 * const { currentTheme, availableThemes, setTheme } = useTheme();
 * </script>
 * ```
 */

import { storeToRefs } from 'pinia';
import { useThemeStore } from '../store';

export function useTheme() {
  const themeStore = useThemeStore();
  
  // Reactive state from store
  const {
    currentTheme,
    availableThemes,
    isLoading,
    error,
  } = storeToRefs(themeStore);

  // Actions (bound to store)
  const { setTheme, loadTheme, resetTheme } = themeStore;

  // Helper to check if theme is currently selected
  const isThemeSelected = (theme: string) => currentTheme.value === theme;

  // Helper to get theme display name (capitalize first letter)
  const getThemeDisplayName = (theme: string) => {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  // Helper to get theme preview classes
  const getThemePreviewClasses = (theme: string) => {
    return `theme-${theme} bg-base-100 text-base-content border-base-300`;
  };

  return {
    // State
    currentTheme,
    availableThemes,
    isLoading,
    error,

    // Actions
    setTheme,
    loadTheme,
    resetTheme,

    // Helpers
    isThemeSelected,
    getThemeDisplayName,
    getThemePreviewClasses,
  };
}