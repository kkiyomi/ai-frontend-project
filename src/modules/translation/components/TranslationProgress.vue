<!--
  TranslationProgress - Display translation progress bar

  A reusable component for showing translation progress with percentage.
-->
<template>
  <div v-if="isVisible" class="mt-3">
    <div class="bg-gray-200 rounded-full h-3">
      <div
        class="bg-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
    <p class="text-sm text-gray-600 mt-2 font-medium">
      {{ Math.round(progress) }}% complete
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  progress: number;
  isVisible?: boolean;
}

withDefaults(defineProps<Props>(), {
  isVisible: true
});
</script>
