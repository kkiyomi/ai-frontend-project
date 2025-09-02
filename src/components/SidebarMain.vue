<template>
  <div ref="sidebar"
    class="group relative bg-theme-surface border-r border-theme flex flex-col h-full transition-all duration-300 ease-in-out z-20 overflow-hidden"
    :class="isExpanded ? 'w-80' : 'w-12'" 
    @mouseenter="isExpanded = true">
    <SidebarCollapsed v-if="!isExpanded" :chapters-count="chapters.length" :is-glossary-visible="isGlossaryVisible"
      @toggle-glossary="toggleGlossaryVisibility" @cycle-theme="cycleTheme" />

    <SidebarExpanded v-if="isExpanded" :is-glossary-visible="isGlossaryVisible" :current-theme-config="currentThemeConfig"
      @toggle-glossary="toggleGlossaryVisibility" @cycle-theme="cycleTheme" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import SidebarCollapsed from './SidebarCollapsed.vue';
import SidebarExpanded from './SidebarExpanded.vue';
import { useChapters } from '../composables/useChapters';
import { useGlossary } from '../composables/useGlossary';
import { useTheme } from '../composables/useTheme';

const { chapters } = useChapters();
const { isGlossaryVisible, toggleGlossaryVisibility } = useGlossary();
const { currentThemeConfig, cycleTheme } = useTheme();

const sidebar = ref<HTMLElement | null>(null);
const isExpanded = ref(false);

const closeSidebarIfClickedOutside = (event: MouseEvent) => {
  if (sidebar.value && !sidebar.value.contains(event.target as Node)) {
    isExpanded.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeSidebarIfClickedOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeSidebarIfClickedOutside);
});
</script>