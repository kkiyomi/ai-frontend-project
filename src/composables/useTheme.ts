import { ref, computed, watch } from 'vue';

export type Theme = 'light' | 'dracula' | 'night-owl';

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}

const themes: Record<Theme, ThemeConfig> = {
  light: {
    name: 'Light',
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
  dracula: {
    name: 'Dracula',
    colors: {
      primary: '#ff79c6',
      secondary: '#6272a4',
      accent: '#50fa7b',
      background: '#282a36',
      surface: '#44475a',
      text: '#f8f8f2',
      textSecondary: '#6272a4',
      border: '#44475a',
      success: '#50fa7b',
      warning: '#ffb86c',
      error: '#ff5555',
    },
  },
  'night-owl': {
    name: 'Night Owl',
    colors: {
      primary: '#7c3aed',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#011627',
      surface: '#0d1117',
      text: '#d6deeb',
      textSecondary: '#82aaff',
      border: '#1e293b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#f87171',
    },
  },
};

const currentTheme = ref<Theme>('light');

export function useTheme() {
  // Load theme from localStorage on initialization
  const savedTheme = localStorage.getItem('theme') as Theme;
  if (savedTheme && savedTheme in themes) {
    currentTheme.value = savedTheme;
  }

  const currentThemeConfig = computed(() => themes[currentTheme.value]);

  const availableThemes = computed(() => 
    Object.entries(themes).map(([key, config]) => ({
      id: key as Theme,
      name: config.name,
    }))
  );

  const setTheme = (theme: Theme) => {
    if (themes[theme]) {
      currentTheme.value = theme;
      localStorage.setItem('theme', theme);
      applyThemeToDocument(theme);
    }
  };

  const cycleTheme = () => {
    const themeKeys = Object.keys(themes) as Theme[];
    const currentIndex = themeKeys.indexOf(currentTheme.value);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex] as Theme);
  };

  const applyThemeToDocument = (theme: Theme) => {
    const config = themes[theme];
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(config.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply theme class to body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
  };

  // Watch for theme changes and apply them
  watch(currentTheme, (newTheme: Theme) => {
    applyThemeToDocument(newTheme);
  }, { immediate: true });

  return {
    currentTheme: computed(() => currentTheme.value),
    currentThemeConfig,
    availableThemes,
    setTheme,
    cycleTheme,
    themes,
  };
}
