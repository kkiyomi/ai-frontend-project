<template>
  <div>
    <div v-if="chapters.length === 0" class="p-4 text-center">
      <p class="text-xs text-gray-500">No chapters in this series</p>
      <p class="text-xs text-gray-400 mt-1">Upload files to add chapters</p>
    </div>

    <!-- Virtual scrolling container for large chapter lists -->
    <div v-else class="h-full">
      <!-- Chapter count indicator for large lists -->
      <div v-if="chapters.length > 50" class="p-2 bg-yellow-50 border-b border-yellow-200">
        <p class="text-xs text-yellow-700 text-center">
          📚 {{ chapters.length }} chapters in this series
        </p>
      </div>
      
      <!-- Virtual scrolling for large lists -->
      <VirtualScrollingList
        v-if="chapters.length > 50"
        :items="chapters"
        :visible-count="30"
        :buffer="5"
        item-key="id"
        class="divide-y divide-gray-100 h-full"
      >
        <template #item="{ item }">
          <ChapterItem
            :chapter="item"
            @delete="$emit('delete', item)"
          />
        </template>
      </VirtualScrollingList>
      
      <!-- Regular list for smaller lists -->
      <div v-else class="overflow-y-auto divide-y divide-gray-100 h-full">
        <ChapterItem
          v-for="chapter in chapters"
          :key="chapter.id"
          :chapter="chapter"
          @delete="$emit('delete', chapter)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChaptersStore } from '../store';
import ChapterItem from './ChapterItem.vue';
import { VirtualScrollingList } from '@/modules/core';
import type { Chapter } from '../types';

interface Props {
  chapters: Chapter[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  delete: [chapter: Chapter];
}>();

</script>