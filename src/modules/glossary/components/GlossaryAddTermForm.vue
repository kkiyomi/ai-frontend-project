<template>
  <div class="p-4 border-b border-base-300 bg-base-200">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-base-content">Add New Term</h3>
      <button
        @click="cancel"
        class="text-sm text-base-content/60 hover:text-base-content/80 transition-colors"
      >
        Cancel
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-3">
      <div>
        <input
          v-model="newTerm.term"
          type="text"
          placeholder="Term (e.g., character name)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          required
        />
        <p v-if="termExistsError" class="text-xs text-red-600 mt-1">{{ termExistsError }}</p>
      </div>
      <div>
        <input
          v-model="newTerm.translation"
          type="text"
          placeholder="Translation"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          required
        />
      </div>
      <div>
        <textarea
          v-model="newTerm.definition"
          placeholder="Definition or context"
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
        ></textarea>
      </div>
      <div>
        <select
          v-model="newTerm.category"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Select category...</option>
          <option value="Character">Character</option>
          <option value="Place">Place</option>
          <option value="Cultural">Cultural</option>
          <option value="Other">Other</option>
        </select>
        <input
          v-if="newTerm.category === '' || !['Character', 'Place', 'Cultural', 'Idiom', 'Other'].includes(newTerm.category)"
          v-model="newTerm.category"
          type="text"
          placeholder="Enter custom category"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mt-2"
        />
      </div>
      
      <button
        type="submit"
        :disabled="!newTerm.term.trim() || !newTerm.translation.trim() || !!termExistsError"
        class="w-full px-4 py-2 btn btn-primary transition-colors text-sm font-medium"
        :class="{ 'opacity-50 cursor-not-allowed': !newTerm.term.trim() || !newTerm.translation.trim() || !!termExistsError }"
      >
        Add Term
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGlossaryStore } from '../store';
import type { GlossaryTerm } from '../types';
import type { Series, Chapter } from '@/types';

interface Props {
  series?: Series | null;
  chapter?: Chapter | null;
  initialTerm?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  added: [];
  canceled: [];
}>();

const store = useGlossaryStore();
const { termExistsInSeries, addTerm } = store;

const newTerm = ref({
  term: '',
  translation: '',
  definition: '',
  category: 'Character',
  isUserDefined: true,
});

const termExistsError = ref('');

const handleSubmit = async () => {
  if (!newTerm.value.term.trim() || !newTerm.value.translation.trim()) return;
  if (!props.series) return;

  const exists = await termExistsInSeries(newTerm.value.term.trim());
  if (exists) {
    termExistsError.value = 'This term already exists in the current series';
    return;
  }

  await addTerm({
    term: newTerm.value.term.trim(),
    translation: newTerm.value.translation.trim(),
    definition: newTerm.value.definition.trim(),
    category: newTerm.value.category,
    isUserDefined: true,
    seriesId: props.series.id,
    chapterId: props.chapter?.id,
  });

  resetForm();
  emit('added');
};

const cancel = () => {
  resetForm();
  emit('canceled');
};

const resetForm = () => {
  newTerm.value = {
    term: '',
    translation: '',
    definition: '',
    category: 'Character',
    isUserDefined: true,
  };
  termExistsError.value = '';
};

watch(() => newTerm.value.term, () => {
  termExistsError.value = '';
});

watch(() => props.initialTerm, (newVal) => {
  if (newVal) {
    newTerm.value.term = newVal;
  }
});
</script>