<!--
  TranslationProgress - Display translation progress bar

  A reusable component for showing translation progress with percentage.
-->
<template>
  <div v-if="isVisible" class="mt-3">
    <progress
      class="progress progress-primary h-3 rounded-full shadow-sm"
      :value="progress"
      max="100"
    ></progress>
    <p class="text-sm text-gray-600 mt-2 font-medium">
      {{ Math.round(progress) }}% complete
    </p>
  </div>
</template>

<script setup lang="ts">
import { useTranslationStore } from '../store';
import { computed } from 'vue';

const store = useTranslationStore();
const progress = computed(() => store.translationProgress);
const isVisible = computed(() => store.isTranslating && progress.value > 0);
</script>
