<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Edit Series</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Series Name</label>
          <input
            v-model="editedName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter series name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
          <textarea
            v-model="editedDescription"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Enter series description"
          ></textarea>
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
            :disabled="!editedName.trim() || isSaving"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Series } from '../types';

interface Props {
  series: Series;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  save: [name: string, description?: string];
}>();

const editedName = ref('');
const editedDescription = ref('');
const isSaving = ref(false);

onMounted(() => {
  editedName.value = props.series.name;
  editedDescription.value = props.series.description || '';
});

const handleSave = async () => {
  if (!editedName.value.trim()) return;
  
  isSaving.value = true;
  try {
    emit('save', editedName.value.trim(), editedDescription.value.trim() || undefined);
  } finally {
    isSaving.value = false;
  }
};
</script>