<template>
  <div class="h-screen flex" style="background-color: var(--color-background);">
    <!-- Sidebar -->
    <!-- <Sidebar /> -->
    <SidebarMain />

    <!-- Main Content -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Translation View (always full width) -->
      <div class="h-full">
        <TranslationView />
      </div>

      <!-- Glossary Panel Overlay -->
      <div v-if="isGlossaryVisible" class="absolute inset-0 bg-black/50 z-30 flex justify-end"
        @click="closeGlossaryIfClickedOutside">
        <!-- Glossary Panel -->
        <div
          class="w-80 h-full shadow-2xl transform transition-transform duration-300 ease-in-out"
          style="background-color: var(--color-surface); border-left: 1px solid var(--color-border);"
          @click.stop>
          <GlossaryPanel />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import SidebarMain from './components/SidebarMain.vue';
import TranslationView from './components/TranslationView.vue';
import GlossaryPanel from './components/GlossaryPanel.vue';
import { useGlossary } from './composables/useGlossary';

const { isGlossaryVisible, toggleGlossaryVisibility } = useGlossary();

const closeGlossaryIfClickedOutside = (event: Event) => {
  if (event.target === event.currentTarget) {
    toggleGlossaryVisibility();
  }
};
</script>