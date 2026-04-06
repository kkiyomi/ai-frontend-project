<template>
  <div v-if="currentChapter" class="border-t border-gray-200 p-4 bg-gray-50">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900">Suggested Terms</h3>
      <button
        @click="$emit('refresh')"
        :disabled="isGenerating"
        class="btn btn-link btn-xs"
      >
        {{ isGenerating ? 'Analyzing...' : 'Refresh' }}
      </button>
    </div>
    
    <div v-if="suggestions.length === 0" class="text-xs text-gray-500">
      No suggestions available
    </div>
    
    <div v-else class="space-y-1">
      <button
        v-for="suggestion in suggestions.slice(0, 5)"
        :key="suggestion"
        @click="$emit('add-suggestion', suggestion)"
        class="btn btn-ghost btn-xs w-full justify-start"
      >
        + {{ suggestion }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chapter } from '@/types';

interface Props {
  currentChapter?: Chapter | null;
  suggestions: string[];
  isGenerating: boolean;
}

defineProps<Props>();

defineEmits<{
  refresh: [];
  'add-suggestion': [suggestion: string];
}>();
</script>