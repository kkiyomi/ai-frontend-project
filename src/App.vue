<template>
  <div class="h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Translation View (full width when glossary is hidden) -->
      <div :class="isGlossaryVisible ? 'pr-80' : ''" class="h-full">
        <TranslationView />
      </div>
      
      <!-- Glossary Panel (positioned absolutely on top) -->
      <div 
        v-if="isGlossaryVisible" 
        class="absolute top-0 right-0 w-80 h-full bg-white border-l border-gray-200 shadow-lg z-10"
      >
        <GlossaryPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import TranslationView from './components/TranslationView.vue';
import GlossaryPanel from './components/GlossaryPanel.vue';
import { useGlossary } from './composables/useGlossary';

const { isGlossaryVisible } = useGlossary();
</script>