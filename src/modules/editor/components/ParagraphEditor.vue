<template>
  <div class="paragraph-hover border border-transparent rounded-lg p-4 transition-colors group" 
       :class="{ 'border-primary-200 bg-primary-50': isDragging }"
       draggable="true"
       @dragstart="handleDragStart"
       @dragend="handleDragEnd"
       @dragover.prevent
       @drop="handleDrop">
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center space-x-2">
        <span class="text-xs text-secondary-500 font-medium">{{ label }} {{ index + 1 }}</span>
        <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click="$emit('addParagraph', index)"
            class="text-xs text-green-600 hover:text-green-700 transition-colors"
            title="Add paragraph above"
          >
            + Add
          </button>
          <button
            @click="$emit('deleteParagraph', index)"
            class="text-xs text-red-600 hover:text-red-700 transition-colors"
            title="Delete paragraph"
          >
            × Delete
          </button>
        </div>
      </div>
      <div class="flex space-x-2">
        <div v-if="isEditing" class="flex space-x-1">
          <button
            @click="$emit('undo')"
            :disabled="!canUndo"
            class="text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="canUndo ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'"
            title="Undo"
          >
            ↶ Undo
          </button>
          <button
            @click="$emit('redo')"
            :disabled="!canRedo"
            class="text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="canRedo ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'"
            title="Redo"
          >
            ↷ Redo
          </button>
        </div>
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
  canUndo?: boolean;
  canRedo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showEditButton: true,
  emptyMessage: 'No content yet',
  placeholder: 'Enter content...',
  type: 'original',
  isHighlightEnabled: false,
  canUndo: false,
  canRedo: false,
});

const emit = defineEmits<{
  toggleEditing: [index: number];
  save: [index: number, content: string];
  cancel: [index: number];
  addParagraph: [index: number];
  deleteParagraph: [index: number];
  moveParagraph: [fromIndex: number, toIndex: number];
  undo: [];
  redo: [];
}>();

const editableContent = ref(props.content);
const isDragging = ref(false);
const draggedOver = ref(false);

// Reset editable content when content changes
watch(() => props.content, (newContent: string) => {
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

// Drag and drop handlers
const handleDragStart = (event: DragEvent) => {
  isDragging.value = true;
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', props.index.toString());
    event.dataTransfer.effectAllowed = 'move';
  }
};

const handleDragEnd = () => {
  isDragging.value = false;
  draggedOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  draggedOver.value = false;
  
  if (event.dataTransfer) {
    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'));
    if (fromIndex !== props.index) {
      emit('moveParagraph', fromIndex, props.index);
    }
  }
};
</script>