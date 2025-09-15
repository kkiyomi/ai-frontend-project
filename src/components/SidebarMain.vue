<template>
  <div 
    ref="sidebar"
    class="group relative bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out z-20"
    :class="isExpanded ? 'w-80' : 'w-12'" 
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
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
import { useGlossary } from '../composables/useGlossary';

const { chapters } = useChapters();
const { isGlossaryVisible, toggleGlossaryVisibility } = useGlossary();

const sidebar = ref<HTMLElement | null>(null);
const isExpanded = ref(false);
const isLocked = ref(false);

const handleMouseEnter = () => {
  isExpanded.value = true;
};

const handleMouseLeave = () => {
  if (!isLocked.value) {
    isExpanded.value = false;
  }
};

const closeSidebarIfClickedOutside = (event: MouseEvent) => {
  if (sidebar.value && !sidebar.value.contains(event.target as Node) && !isLocked.value) {
    isExpanded.value = false;
  }
};

// Lock sidebar when performing actions inside
const lockSidebar = () => {
  isLocked.value = true;
  setTimeout(() => {
    isLocked.value = false;
  }, 500); // Keep open for 500ms after action
};

onMounted(() => {
  document.addEventListener('click', closeSidebarIfClickedOutside);
  
  // Listen for sidebar actions to lock it temporarily
  sidebar.value?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      lockSidebar();
    }
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeSidebarIfClickedOutside);
});
</script>