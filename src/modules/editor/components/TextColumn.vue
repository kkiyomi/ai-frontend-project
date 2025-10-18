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
    
    <div class="flex-1 flex flex-col p-4 overflow-y-auto">
      <!-- Full Text Mode -->
      <div v-if="mode === 'full'" class="flex max-w-4xl h-full">
        <div v-if="!isEditingMode && fullText" 
             class="reading-text text-secondary-900 leading-relaxed space-y-4"
             v-html="displayFullText">
        </div>
        <div v-else-if="!isEditingMode && !fullText" class="text-secondary-400 italic">
          {{ emptyMessage }}
        </div>
        
        <textarea
          v-else
          v-model="editableFullText"
          @blur="$emit('saveFullText', editableFullText)"
          class="flex-1 w-full p-4 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 reading-text resize-none"
          :placeholder="placeholder"
        ></textarea>
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
          @toggleEditing="handleToggleEditing"
          @save="handleSave"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import ParagraphEditor from './ParagraphEditor.vue';

interface Props {
  title: string;
  paragraphs: string[];
  fullText?: string;
  mode: 'paragraph' | 'full';
  type: 'original' | 'translated';
  editingParagraphs: Set<number>;
  isEditingMode?: boolean;
  showBorder?: boolean;
  showEditButton?: boolean;
  emptyMessage?: string;
  placeholder?: string;
  highlightTermsInText?: (text: string) => string;
  isHighlightEnabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditingMode: false,
  showBorder: false,
  showEditButton: false,
  emptyMessage: 'No content yet',
  placeholder: 'Enter content...',
  isHighlightEnabled: false,
});

const emit = defineEmits<{
  toggleEdit: [];
  saveFullText: [text: string];
  toggleParagraphEditing: [index: number];
  saveParagraph: [index: number, content: string];
  cancelParagraphEdit: [index: number];
}>();

const editableFullText = computed({
  get: () =>
    (props.fullText ?? "").replace(/<br\s*\/?>/gi, "\n\n"),
  set: (val: string) => {
    // convert newlines back to <br> before emitting
    emit("saveFullText", val.replace(/\n+/g, "<br>"));
  },
});

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
</script>