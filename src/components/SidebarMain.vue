<template>
  <div 
    ref="sidebar"
    class="group relative bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out z-20"
    :class="isExpanded ? 'w-80' : 'w-12'" 
    @mouseenter="handleMouseEnter"
  >
    <SidebarCollapsed v-if="!isExpanded" :chapters-count="chapters.length" :is-glossary-visible="isGlossaryVisible"
      @toggle-glossary="toggleGlossaryVisibility" />

    <SidebarExpanded v-if="isExpanded" :is-glossary-visible="isGlossaryVisible"
      @toggle-glossary="toggleGlossaryVisibility" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import SidebarCollapsed from './SidebarCollapsed.vue';
import SidebarExpanded from './SidebarExpanded.vue';
import { useChapters } from '../composables/useChapters';
import { useGlossaryStore } from '@/modules/glossary';

const { chapters } = useChapters();
const glossary = useGlossaryStore();
const { isGlossaryVisible, toggleVisibility: toggleGlossaryVisibility } = glossary;

const sidebar = ref<HTMLElement | null>(null);
const isExpanded = ref(false);

const handleMouseEnter = () => {
  isExpanded.value = true;
};

const closeSidebarIfClickedOutside = (event: MouseEvent) => {
  if (!sidebar.value || !isExpanded.value) return;

  const target = event.target as HTMLElement;

  // Check if the clicked element is the sidebar or any of its descendants
  const isInsideSidebar = sidebar.value.contains(target) || sidebar.value === target;

  if (!isInsideSidebar) {
    isExpanded.value = false;
  }
};

onMounted(() => {
  // Use capture phase to ensure we catch the event before any child components
  document.addEventListener('click', closeSidebarIfClickedOutside, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeSidebarIfClickedOutside, true);
});
</script>