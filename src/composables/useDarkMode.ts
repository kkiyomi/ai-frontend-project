import { ref, onMounted, watch } from 'vue';

const isDarkMode = ref(false);
const isInitialized = ref(false);

export function useDarkMode() {
  const initializeDarkMode = () => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark';
    } else {
      // Check system preference
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    applyTheme();
    isInitialized.value = true;
  };

  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
    applyTheme();
  };

  const setDarkMode = (dark: boolean) => {
    isDarkMode.value = dark;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    applyTheme();
  };

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    // Only update if user hasn't set a preference
    if (!localStorage.getItem('theme')) {
      isDarkMode.value = e.matches;
      applyTheme();
    }
  };

  onMounted(() => {
    initializeDarkMode();
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  });

  // Watch for changes and apply theme
  watch(isDarkMode, applyTheme);

  return {
    isDarkMode,
    isInitialized,
    toggleDarkMode,
    setDarkMode,
    initializeDarkMode
  };
}