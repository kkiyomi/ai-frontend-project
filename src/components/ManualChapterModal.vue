<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Add New Chapter</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleCreate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Chapter Title</label>
          <input
            v-model="chapterTitle"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter chapter title"
            autofocus
          />
        </div>

        <div class="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!chapterTitle.trim() || isCreating"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ isCreating ? 'Creating...' : 'Create Chapter' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  close: [];
  create: [title: string];
}>();

const chapterTitle = ref('');
const isCreating = ref(false);

const handleCreate = async () => {
  if (!chapterTitle.value.trim()) return;
  
  isCreating.value = true;
  try {
    emit('create', chapterTitle.value.trim());
  } finally {
    isCreating.value = false;
  }
};
</script>