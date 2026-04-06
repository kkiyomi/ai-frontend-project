<!--
  GlossaryTermPopup - Glossary Module Component
-->
<template>
  <div 
    v-if="term"
    class="glossary-popup absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm transition-opacity duration-150"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @click.stop
  >
    <div v-if="!isEditing" class="space-y-2">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <span class="font-semibold text-gray-900">{{ term.term }}</span>
            <!-- <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"> -->
            <!--   {{ getCategoryIcon(term.category) }} -->
            <!-- </span> -->
          </div>
          <p class="text-sm text-green-600 font-medium mt-1">{{ term.translation }}</p>
          <p v-if="term.definition" class="text-xs text-gray-500 mt-1">{{ term.definition }}</p>
        </div>
        <button
          @click="startEditing"
          class="btn btn-ghost btn-square btn-sm ml-2"
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
        <span v-if="term.isUserDefined" class="badge badge-outline badge-sm">Custom</span>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-else class="space-y-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Edit Term</span>
        <button
          @click="cancelEdit"
          class="btn btn-link btn-xs"
        >
          Cancel
        </button>
      </div>
      
      <input
        v-model="editForm.term"
        type="text"
        placeholder="Term"
        class="input input-bordered input-sm w-full"
      />
      <input
        v-model="editForm.translation"
        type="text"
        placeholder="Translation"
        class="input input-bordered input-sm w-full"
      />
      <textarea
        v-model="editForm.definition"
        placeholder="Definition"
        rows="2"
        class="textarea textarea-bordered textarea-sm w-full resize-none"
      ></textarea>
      <input
        v-model="editForm.category"
        type="text"
        placeholder="Category"
        class="input input-bordered input-sm w-full"
      />
      
      <div class="flex items-center space-x-2">
        <button
          @click="saveEdit"
          :disabled="!editForm.term.trim() || !editForm.translation.trim()"
          class="btn btn-primary btn-xs"
        >
          Save
        </button>
        <button
          @click="cancelEdit"
          class="btn btn-ghost btn-xs"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useGlossaryStore } from '../store';
import { useGlossaryPopup } from '../composables/useGlossaryPopup';
import type { GlossaryTerm } from '../types';

const {
  updateTerm
} = useGlossaryStore();

const {
  closePopup
} = useGlossaryPopup();

interface Props {
  term: GlossaryTerm;
  position: { x: number; y: number };
}

const props = defineProps<Props>();

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

const handleTermUpdate = async (termId: string, updates: Partial<GlossaryTerm>) => {
  await updateTerm(termId, updates);
  closePopup();
};

const saveEdit = () => {
  if (!editForm.term.trim() || !editForm.translation.trim()) return;
  
  handleTermUpdate(props.term.id, {
    term: editForm.term.trim(),
    translation: editForm.translation.trim(),
    definition: editForm.definition.trim(),
    category: editForm.category.trim()
  });
  
  isEditing.value = false;
};

// const getCategoryIcon = (category: string): string => {
//   const icons = {
//     'Character': '👤',
//     'Place': '📍',
//     'Cultural': '🏛️',
//     'Idiom': '💭',
//     'Other': '📝',
//   };
//   return icons[category] || '📝';
// };
</script>