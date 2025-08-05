<template>
  <div class="h-screen flex bg-secondary-50">

    <!-- Main Content -->
    <div class="flex-1 flex">
      <!-- Translation View -->
      <div class="flex-1">
        <TranslationView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TranslationView from './components/TranslationView.vue';

const isGlossaryVisible = ref(false);

const toggleGlossary = () => {
  isGlossaryVisible.value = !isGlossaryVisible.value;
};
</script>