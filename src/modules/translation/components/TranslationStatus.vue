<!--
  TranslationStatus - Display translation status indicator

  Shows visual feedback for translation operations.
-->
<template>
  <div v-if="store.isTranslating" class="flex items-center space-x-2 text-primary">
    <span class="loading loading-spinner loading-xs"></span>
    <span class="text-sm font-medium">Translating...</span>
  </div>
</template>

<script setup lang="ts">
import { useTranslationStore } from '../store';

const store = useTranslationStore();
</script>
