<!--
  TranslationStatus - Display translation status indicator

  Shows visual feedback for translation operations.
-->
<template>
  <div v-if="isTranslating" class="flex items-center space-x-2 text-blue-600">
    <div class="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
    <span class="text-sm font-medium">{{ message }}</span>
  </div>
  <div v-else-if="hasError" class="flex items-center space-x-2 text-red-600">
    <span class="text-sm font-medium">{{ errorMessage }}</span>
  </div>
  <div v-else-if="isComplete" class="flex items-center space-x-2 text-green-600">
    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>
    <span class="text-sm font-medium">Translation complete</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isTranslating: boolean;
  hasError?: boolean;
  isComplete?: boolean;
  message?: string;
  errorMessage?: string;
}

withDefaults(defineProps<Props>(), {
  hasError: false,
  isComplete: false,
  message: 'Translating...',
  errorMessage: 'Translation failed'
});
</script>
