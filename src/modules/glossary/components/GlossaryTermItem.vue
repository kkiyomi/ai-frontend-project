<template>
  <div class="group p-3 bg-base-100 border border-base-300 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all">
    <div v-if="!isEditing" class="space-y-2">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <span class="font-medium text-base-content text-sm">{{ term.term }}</span>
            <span v-if="!term.chapterId" class="badge badge-outline badge-sm">
              Series
            </span>
          </div>
          <p class="text-sm text-green-600 font-medium mt-1">{{ term.translation }}</p>
          <p v-if="term.definition" class="text-xs text-base-content/60 mt-1">{{ term.definition }}</p>
        </div>
        
        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
           <button
            @click="startEditing"
            class="btn btn-ghost btn-xs btn-circle p-1 text-base-content/40 hover:text-primary/70 transition-colors"
            title="Edit term"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
           <button
            @click="removeTerm"
            class="btn btn-ghost btn-xs btn-circle p-1 text-base-content/40 hover:text-red-500 transition-colors"
            title="Remove term"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="flex items-center justify-between text-xs text-base-content/40">
        <span>Used {{ term.frequency }} times</span>
        <span v-if="term.isUserDefined" class="badge badge-outline badge-sm">Custom</span>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-else class="space-y-2">
      <input
        v-model="editForm.term"
        type="text"
        class="input input-bordered input-sm w-full"
      />
      <input
        v-model="editForm.translation"
        type="text"
        class="input input-bordered input-sm w-full"
      />
      <textarea
        v-model="editForm.definition"
        rows="2"
        class="textarea textarea-bordered textarea-sm w-full resize-none"
      ></textarea>
      <select
        v-model="editForm.category"
        placeholder="Category"
        class="select select-bordered select-sm w-full mt-1"
      />
      <div class="flex items-center space-x-2">
           <button
            @click="saveEdit"
            :disabled="!editForm.term.trim() || !editForm.translation.trim()"
            class="btn btn-primary btn-xs disabled:opacity-50 transition-colors"
          >
          Save
        </button>
           <button
            @click="cancelEdit"
            class="btn btn-ghost btn-xs transition-colors"
          >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useGlossaryStore } from '../store';
import type { GlossaryTerm } from '../types';

interface Props {
  term: GlossaryTerm;
}

const props = defineProps<Props>();

const store = useGlossaryStore();
const { updateTerm, removeTerm: storeRemoveTerm } = store;

const isEditing = ref(false);
const editForm = reactive({
  term: '',
  translation: '',
  definition: '',
  category: ''
});

const startEditing = () => {
  editForm.term = props.term.term;
  editForm.translation = props.term.translation;
  editForm.definition = props.term.definition || '';
  editForm.category = props.term.category;
  isEditing.value = true;
};

const cancelEdit = () => {
  editForm.term = props.term.term;
  editForm.translation = props.term.translation;
  editForm.definition = props.term.definition || '';
  editForm.category = props.term.category;
  isEditing.value = false;
};

const saveEdit = async () => {
  if (!editForm.term.trim() || !editForm.translation.trim()) return;
  
  await updateTerm(props.term.id, {
    term: editForm.term.trim(),
    translation: editForm.translation.trim(),
    definition: editForm.definition.trim(),
    category: editForm.category.trim()
  });
  
  isEditing.value = false;
};

const removeTerm = async () => {
  await storeRemoveTerm(props.term.id);
};
</script>