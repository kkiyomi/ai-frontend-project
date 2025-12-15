<!--
  TranslationToolbar - Toolbar with translation actions

  Provides controls for translation operations.
-->
<template>
  <div class="flex items-center space-x-2">
    <button
      v-if="showTranslateButton"
      @click="$emit('translate')"
      :disabled="store.isTranslating || disabled"
      class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md text-sm font-semibold transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ buttonText }}
    </button>

    <button
      v-if="showRetranslateButton"
      @click="$emit('retranslate')"
      :disabled="store.isTranslating || disabled"
      class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
    >
      Retranslate with Glossary
    </button>

    <button
      v-if="showClearButton"
      @click="$emit('clear')"
      :disabled="store.isTranslating"
      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium border border-gray-300"
    >
      Clear Translation
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTranslationStore } from '../store';

const store = useTranslationStore();

interface Props {
  disabled?: boolean;
  showTranslateButton?: boolean;
  showRetranslateButton?: boolean;
  showClearButton?: boolean;
  buttonText?: string;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  showTranslateButton: true,
  showRetranslateButton: false,
  showClearButton: false,
  buttonText: 'Translate'
});

defineEmits<{
  translate: [];
  retranslate: [];
  clear: [];
}>();
</script>
