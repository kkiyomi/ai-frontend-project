<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">Series</h3>
      <button
        @click="$emit('create')"
        class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        + New Series
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading series...
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-500">
      {{ error }}
    </div>

    <div v-else-if="series.length === 0" class="text-center py-8 text-gray-500">
      No series found. Create your first series to get started.
    </div>

    <div v-else class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <SeriesCard
        v-for="s in series"
        :key="s.id"
        :series="s"
        @select="$emit('select', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import SeriesCard from './SeriesCard.vue';
import type { Series } from '../types';

interface Props {
  series: Series[];
  loading?: boolean;
  error?: string | null;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
});

defineEmits<{
  select: [seriesId: string];
  edit: [series: Series];
  delete: [seriesId: string];
  create: [];
}>();
</script>
