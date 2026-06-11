<template>
  <div class="sticky top-0 z-10 flex items-center px-4 py-2 bg-base-100/80 backdrop-blur border-b border-base-200">
    <a href="https://absolutemystery.com" target="_blank" class="text-sm font-semibold text-base-content/60 hover:text-primary transition-colors no-underline flex items-center gap-1.5 shrink-0">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      Absolute Mystery
    </a>
    <span v-if="title" class="flex-1 text-center text-sm font-medium text-base-content/70 truncate px-2">{{ title }}</span>
    <span v-else class="flex-1" />
    <button
      @click="toggleTheme"
      class="btn btn-ghost btn-sm btn-circle shrink-0 mr-1"
      :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    >
      <!-- Sun icon (shown in dark mode → switch to light) -->
      <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <!-- Moon icon (shown in light mode → switch to dark) -->
      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>
    <div class="shrink-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/modules/theme';

defineProps<{ title?: string }>();

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.currentTheme === 'am-dark');

function toggleTheme() {
  themeStore.setTheme(isDark.value ? 'am-light' : 'am-dark');
}
</script>
