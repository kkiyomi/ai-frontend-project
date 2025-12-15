<!--
  TranslationStatus - Display translation status indicator

  Shows visual feedback for translation operations.
-->
<template>
  <div v-if="store.isTranslating" class="flex items-center space-x-2 text-blue-600">
    <div class="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
    <span class="text-sm font-medium">Translating...</span>
  </div>
</template>

<script setup lang="ts">
import { useTranslationStore } from '../store';

const store = useTranslationStore();
</script>
