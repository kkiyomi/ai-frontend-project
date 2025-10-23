<template>
  <div class="flex-1 flex flex-col" :class="{ 'border-r border-secondary-200': showBorder }">
    <div class="p-4 border-b border-secondary-200" :class="headerClass">
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-secondary-900">{{ title }}</h3>
        <button
          @click="$emit('toggleEdit')"
          class="text-xs text-blue-600 hover:text-blue-700 transition-colors"
        >
          {{ isEditingMode ? 'Save' : 'Edit' }}
        </button>
      </div>
    </div>
    
    <div class="flex-1 flex flex-col p-4 overflow-y-auto scrollbar-custom">
      <!-- Full Text Mode -->
      <div v-if="mode === 'full'" class="flex flex-col max-w-4xl h-full">
        <div v-if="fullText" 
             class="reading-text text-secondary-900 leading-relaxed space-y-4 flex-1 overflow-y-auto scrollbar-custom"
             v-html="displayFullText">
        </div>
        <div v-else class="text-secondary-400 italic flex-1 flex items-center justify-center">
          {{ emptyMessage }}
        </div>
      </div>

      <!-- Paragraph Mode -->
      <div v-else class="space-y-6 max-w-2xl">
        <ParagraphEditor
          v-for="(paragraph, index) in paragraphs"
          :key="`${type}-${index}`"
          :content="paragraph"
          :index="index"
          :label="paragraphLabel"
          :isEditing="editingParagraphs.has(index)"
          :emptyMessage="emptyMessage"
          :placeholder="placeholder"
          :type="type"
          :highlightTermsInText="highlightTermsInText"
          :isHighlightEnabled="isHighlightEnabled"
          :canUndo="canUndo"
          :canRedo="canRedo"
          @toggleEditing="handleToggleEditing"
          @save="handleSave"
          @cancel="handleCancel"
          @addParagraph="handleAddParagraph"
          @deleteParagraph="handleDeleteParagraph"
          @moveParagraph="handleMoveParagraph"
          @undo="$emit('undo')"
          @redo="$emit('redo')"
        />
        
        <!-- Add Paragraph Button -->
        <div class="flex justify-center pt-4">
          <button
            @click="handleAddParagraph(paragraphs.length)"
            class="flex items-center space-x-2 px-4 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 rounded-lg transition-colors"
            title="Add new paragraph"
          >
            <span class="text-lg">+</span>
            <span>Add {{ paragraphLabel }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ParagraphEditor from './ParagraphEditor.vue';

interface Props {
  title: string;
  paragraphs: string[];
  fullText?: string;
  mode: 'paragraph' | 'full';
  type: 'original' | 'translated';
  editingParagraphs: Set<number>;
  showBorder?: boolean;
  showEditButton?: boolean;
  emptyMessage?: string;
  placeholder?: string;
  highlightTermsInText?: (text: string) => string;
  isHighlightEnabled?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showBorder: false,
  showEditButton: false,
  emptyMessage: 'No content yet',
  placeholder: 'Enter content...',
  isHighlightEnabled: false,
  canUndo: false,
  canRedo: false,
});

const emit = defineEmits<{
  toggleParagraphEditing: [index: number];
  saveParagraph: [index: number, content: string];
  cancelParagraphEdit: [index: number];
  addParagraph: [index: number];
  deleteParagraph: [index: number];
  moveParagraph: [fromIndex: number, toIndex: number];
  undo: [];
  redo: [];
}>();


const headerClass = computed(() => {
  return props.type === 'translated' ? 'bg-accent-50' : 'bg-secondary-50';
});

const paragraphLabel = computed(() => {
  return props.type === 'translated' ? 'Translation' : 'Paragraph';
});

const displayFullText = computed(() => {
  if (!props.fullText) return '';
  
  if (props.isHighlightEnabled && props.highlightTermsInText) {
    return props.highlightTermsInText(props.fullText);
  }
  return props.fullText;
});

const handleToggleEditing = (index: number) => {
  emit('toggleParagraphEditing', index);
};

const handleSave = (index: number, content: string) => {
  emit('saveParagraph', index, content);
};

const handleCancel = (index: number) => {
  emit('cancelParagraphEdit', index);
};

const handleAddParagraph = (index: number) => {
  emit('addParagraph', index);
};

const handleDeleteParagraph = (index: number) => {
  emit('deleteParagraph', index);
};

const handleMoveParagraph = (fromIndex: number, toIndex: number) => {
  emit('moveParagraph', fromIndex, toIndex);
};
</script>