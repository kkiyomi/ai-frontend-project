<template>
  <div class="h-screen flex bg-secondary-50">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 flex">
      <!-- Translation View -->
      <div class="flex-1">
        <TranslationView />
      </div>
      
      <!-- Glossary Panel -->
      <div v-if="isGlossaryVisible" class="w-80 border-l border-secondary-200">
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