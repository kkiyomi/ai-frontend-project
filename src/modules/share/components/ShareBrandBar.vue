<template>
  <div class="sticky top-0 z-10 flex items-center px-4 py-2 bg-base-100/80 backdrop-blur border-b border-base-200">
    <a href="https://absolutemystery.com" target="_blank" class="text-sm font-semibold text-base-content/60 hover:text-primary transition-colors no-underline flex items-center gap-1.5 shrink-0">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      Absolute Mystery
    </a>
    <span v-if="title" class="flex-1 text-center text-sm font-medium text-base-content/70 truncate px-2">{{ title }}</span>
    <div class="shrink-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>();
</script>
