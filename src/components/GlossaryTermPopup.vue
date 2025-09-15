<template>
  <div 
    v-if="term"
    class="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @click.stop
  >
    <div v-if="!isEditing" class="space-y-2">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <span class="font-semibold text-gray-900">{{ term.term }}</span>
            <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {{ getCategoryIcon(term.category) }}
            </span>
          </div>
          <p class="text-sm text-green-600 font-medium mt-1">{{ term.translation }}</p>
          <p v-if="term.definition" class="text-xs text-gray-500 mt-1">{{ term.definition }}</p>
        </div>
        <button
          @click="startEditing"
          class="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="Edit term"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
      
      <div class="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-200">
        <span>Used {{ term.frequency }} times</span>
        <span v-if="term.isUserDefined" class="px-2 py-1 bg-gray-100 rounded-full">Custom</span>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-else class="space-y-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Edit Term</span>
        <button
          @click="cancelEdit"
          class="text-xs text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
      
      <input
        v-model="editForm.term"
        type="text"
        placeholder="Term"
        class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
      />
      <input
        v-model="editForm.translation"
        type="text"
        placeholder="Translation"
        class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
      />
      <textarea
        v-model="editForm.definition"
        placeholder="Definition"
        rows="2"
        class="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
      ></textarea>
      <input
        v-model="editForm.category"
        type="text"
        placeholder="Category"
        class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
      />
      
      <div class="flex items-center space-x-2">
        <button
          @click="saveEdit"
          :disabled="!editForm.term.trim() || !editForm.translation.trim()"
          class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Save
        </button>
        <button
          @click="cancelEdit"
          class="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { GlossaryTerm } from '../types';

interface Props {
  term: GlossaryTerm;
  position: { x: number; y: number };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [termId: string, updates: Partial<GlossaryTerm>];
  close: [];
}>();

const isEditing = ref(false);
const editForm = reactive({
  term: '',
  translation: '',
  definition: '',
  category: ''
});

onMounted(() => {
  // Initialize edit form with current values
  editForm.term = props.term.term;
  editForm.translation = props.term.translation;
  editForm.definition = props.term.definition || '';
  editForm.category = props.term.category;
});

const startEditing = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  // Reset form to original values
  editForm.term = props.term.term;
  editForm.translation = props.term.translation;
  editForm.definition = props.term.definition || '';
  editForm.category = props.term.category;
  isEditing.value = false;
};

const saveEdit = () => {
  if (!editForm.term.trim() || !editForm.translation.trim()) return;
  
  emit('update', props.term.id, {
    term: editForm.term.trim(),
    translation: editForm.translation.trim(),
    definition: editForm.definition.trim(),
    category: editForm.category.trim()
  });
  
  isEditing.value = false;
};

const getCategoryIcon = (category: string): string => {
  const icons = {
    'Character': '👤',
    'Place': '📍',
    'Cultural': '🏛️',
    'Idiom': '💭',
    'Other': '📝',
  };
  return icons[category] || '📝';
};
</script>
</template>