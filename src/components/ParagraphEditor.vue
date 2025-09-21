<template>
  <div class="paragraph-hover border border-transparent rounded-lg p-4 transition-colors">
    <div class="flex items-start justify-between mb-2">
      <span class="text-xs text-secondary-500 font-medium">{{ label }} {{ index + 1 }}</span>
      <div class="flex space-x-2">
        <button
          v-if="showEditButton"
          @click="toggleEditing"
          class="text-xs transition-colors"
          :class="editButtonClass"
        >
          {{ isEditing ? 'Save' : 'Edit' }}
        </button>
      </div>
    </div>
    
    <div v-if="!isEditing" 
         class="reading-text text-secondary-900">
      <div v-if="content" v-html="displayContent"></div>
      <div v-else class="text-secondary-400 italic">{{ emptyMessage }}</div>
    </div>
    
    <textarea
      v-else
      v-model="editableContent"
      @blur="handleSave"
      @keyup.escape="handleCancel"
      class="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:border-secondary-500 reading-text resize-none"
      :class="textareaClass"
      rows="4"
      :placeholder="placeholder"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  content: string;
  index: number;
  label: string;
  isEditing: boolean;
  showEditButton?: boolean;
  emptyMessage?: string;
  placeholder?: string;
  type?: 'original' | 'translated';
  highlightTermsInText?: (text: string) => string;
  isHighlightEnabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showEditButton: true,
  emptyMessage: 'No content yet',
  placeholder: 'Enter content...',
  type: 'original',
  isHighlightEnabled: false,
});

const emit = defineEmits<{
  toggleEditing: [index: number];
  save: [index: number, content: string];
  cancel: [index: number];
}>();

const editableContent = ref(props.content);

// Reset editable content when content changes
watch(() => props.content, (newContent) => {
  editableContent.value = newContent;
});

const displayContent = computed(() => {
  if (props.isHighlightEnabled && props.highlightTermsInText) {
    return props.highlightTermsInText(props.content);
  }
  return props.content;
});

const editButtonClass = computed(() => {
  return props.type === 'translated' 
    ? 'text-primary-600 hover:text-primary-700'
    : 'text-blue-600 hover:text-blue-700';
});

const textareaClass = computed(() => {
  return props.type === 'translated'
    ? 'focus:ring-primary-500 focus:border-primary-500'
    : 'focus:ring-blue-500 focus:border-blue-500';
});

const toggleEditing = () => {
  emit('toggleEditing', props.index);
};

const handleSave = () => {
  emit('save', props.index, editableContent.value);
};

const handleCancel = () => {
  editableContent.value = props.content; // Reset to original
  emit('cancel', props.index);
};
</script>