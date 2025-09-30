<template>
  <router-view v-if="$route.name === 'Share'" />
  <div v-else class="h-screen flex bg-gray-50">
    <!-- Sidebar -->
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
          class="w-80 h-full bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out"
          @click.stop>
          <GlossaryPanel />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarMain from './components/SidebarMain.vue';
import TranslationView from './components/TranslationView.vue';
import { GlossaryPanel, useGlossaryStore } from '@/modules/glossary';

const glossary = useGlossaryStore();
const { isGlossaryVisible, toggleVisibility: toggleGlossaryVisibility } = glossary;

const closeGlossaryIfClickedOutside = (event: Event) => {
  if (event.target === event.currentTarget) {
    toggleGlossaryVisibility();
  }
};
</script>