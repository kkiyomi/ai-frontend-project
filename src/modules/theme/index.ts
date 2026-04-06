/**
 * Theme Module - Public API
 *
 * The Theme module manages appearance preferences and theme switching.
 *
 * Features:
 * - Theme selection from all daisyUI themes
 * - Appearance settings section in global settings modal
 * - Theme persistence across sessions
 * - Integration with Core's centralized settings system
 *
 * Integration Example:
 * ```typescript
 * // In main app
 * import { useThemeStore, appearanceSettings } from '@/modules/theme';
 * import { useSettingsStore } from '@/modules/core';
 *
 * const themeStore = useThemeStore();
 * const settingsManager = useSettingsStore();
 *
 * // Register appearance settings
 * settingsManager.registerSection(appearanceSettings);
 *
 * // Load saved theme on app startup
 * themeStore.loadTheme();
 * ```
 *
 * Module Independence:
 * - Does NOT import from other domain modules (billing, glossary, etc.)
 * - Only depends on Core for infrastructure (types, utilities)
 * - Provides theme switching functionality to the entire app
 */

// Store
export { useThemeStore } from './store';

// Composables
export { useTheme } from './composables/useTheme';

// Components
export { default as ThemeSettings } from './components/ThemeSettings.vue';

// Types
export type {
  ThemeState,
  DaisyUITheme,
} from './types';

export { DAISYUI_THEMES } from './types';

export { appearanceSettings } from './settings';