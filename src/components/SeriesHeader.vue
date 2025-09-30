<template>
  <div class="p-4 border-b border-gray-200 bg-gray-50">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900">Series</h3>
      <div class="flex items-center space-x-2">
        <button 
          @click="toggleAddForm"
          class="text-xs text-blue-600 hover:text-blue-700 transition-colors"
        >
          {{ showAddForm ? 'Cancel' : '+ Series' }}
        </button>
      </div>
    </div>

    <!-- Add Series Form -->
    <div v-if="showAddForm" class="space-y-2">
      <input 
        v-model="newSeriesName" 
        type="text" 
        placeholder="Series name"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        @keyup.enter="handleCreateSeries" 
      />
      <div class="flex space-x-2">
        <button 
          @click="handleCreateSeries" 
          :disabled="!newSeriesName.trim()"
          class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Save
        </button>
      </div>
    </div>

    <!-- Add Chapter Form -->
    <div v-if="showAddChapterForm" class="space-y-2">
      <input 
        v-model="newChapterTitle" 
        type="text" 
        placeholder="Chapter title"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
        @keyup.enter="handleCreateChapter" 
      />
      <div class="flex space-x-2">
        <button 
          @click="handleCreateChapter" 
          :disabled="!newChapterTitle.trim()"
          class="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          Save
        </button>
        <button 
          @click="cancelAddChapter"
          class="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  showAddChapterForm: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  createSeries: [name: string];
  createChapter: [title: string];
  cancelAddChapter: [];
  showAddChapter: [];
}>();

const showAddForm = ref(false);
const newSeriesName = ref('');
const newChapterTitle = ref('');

const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value;
  if (!showAddForm.value) {
    newSeriesName.value = '';
  }
};

const handleCreateSeries = () => {
  if (!newSeriesName.value.trim()) return;
  
  emit('createSeries', newSeriesName.value.trim());
  newSeriesName.value = '';
  showAddForm.value = false;
};

const handleCreateChapter = () => {
  if (!newChapterTitle.value.trim()) return;
  
  emit('createChapter', newChapterTitle.value.trim());
  newChapterTitle.value = '';
};

const cancelAddChapter = () => {
  newChapterTitle.value = '';
  emit('cancelAddChapter');
};
</script>