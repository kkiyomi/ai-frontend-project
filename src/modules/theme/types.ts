/**
 * Theme Module - Type Definitions
 *
 * Defines all types for theme and appearance functionality
 */

export interface ThemeState {
  currentTheme: string;
  availableThemes: string[];
  isLoading: boolean;
  error: string | null;
}

// All daisyUI v5.5.19 themes
export const DAISYUI_THEMES = [
  'am-light',
  'am-dark',
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
] as const;

export type DaisyUITheme = typeof DAISYUI_THEMES[number];