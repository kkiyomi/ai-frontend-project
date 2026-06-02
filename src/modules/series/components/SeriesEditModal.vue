<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl" @click.stop>
      <div class="flex items-center justify-between mb-4">
         <h3 class="text-lg font-semibold text-base-content">{{ modalTitle }}</h3>
        <button @click="$emit('close')" class="btn btn-ghost btn-sm btn-circle">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-base-content mb-2">Series Name</label>
          <input
            v-model="editedName"
            type="text"
            required
            class="input input-bordered w-full"
            placeholder="Enter series name"
          />
        </div>

         <div>
           <label class="block text-sm font-medium text-base-content mb-2">Description (optional)</label>
           <textarea
             v-model="editedDescription"
             rows="3"
             class="textarea textarea-bordered w-full resize-none"
             placeholder="Enter series description"
           ></textarea>
         </div>

         <div>
           <label class="block text-sm font-medium text-base-content mb-2">Source Language (optional)</label>
           <select
             v-model="editedSourceLanguage"
             class="select select-bordered w-full"
             :disabled="languagesLoading"
           >
             <option value=""></option>
             <option
               v-for="lang in languages"
               :key="lang.code"
               :value="lang.code"
             >
               {{ lang.name }} ({{ lang.code }})
             </option>
           </select>
         </div>

         <div>
           <label class="block text-sm font-medium text-base-content mb-2">Target Language (optional)</label>
           <select
             v-model="editedTargetLanguage"
             class="select select-bordered w-full"
             :disabled="languagesLoading"
           >
             <option value=""></option>
             <option
               v-for="lang in languages"
               :key="lang.code"
               :value="lang.code"
             >
               {{ lang.name }} ({{ lang.code }})
             </option>
           </select>
         </div>

         <div class="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
             class="btn btn-ghost btn-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!editedName.trim() || isSaving || languagesLoading"
             class="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Series, Language } from '../types';
import { seriesAPI } from '../api';

interface Props {
  series?: Series;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  save: [data: { name: string; description?: string; sourceLanguage?: string; targetLanguage?: string }];
}>();

const editedName = ref('');
const editedDescription = ref('');
const editedSourceLanguage = ref('');
const editedTargetLanguage = ref('');
const isSaving = ref(false);
const languages = ref<Language[]>([]);
const languagesLoading = ref(true);
const modalTitle = computed(() => props.series ? 'Edit Series' : 'Create Series');

onMounted(async () => {
  editedName.value = props.series?.name ?? '';
  editedDescription.value = props.series?.description ?? '';
  editedSourceLanguage.value = props.series?.sourceLanguage ?? '';
  editedTargetLanguage.value = props.series?.targetLanguage ?? '';

  try {
    const res = await seriesAPI.getLanguages();
    if (res.success && res.data) {
      languages.value = res.data;
    }
  } catch {
    // languages stay empty; user gets no options
  } finally {
    languagesLoading.value = false;
  }
});

const handleSave = async () => {
  if (!editedName.value.trim()) return;

  isSaving.value = true;
  try {
    emit('save', {
      name: editedName.value.trim(),
      description: editedDescription.value.trim() || undefined,
      sourceLanguage: editedSourceLanguage.value || undefined,
      targetLanguage: editedTargetLanguage.value || undefined
    });
  } finally {
    isSaving.value = false;
  }
};
</script>
