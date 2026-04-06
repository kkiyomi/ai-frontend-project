<template>
  <div class="flex-1 flex flex-col" :class="{ 'border-r border-base/30': showBorder }">
    <div class="p-4 border-b border-base/30 bg-base/10">
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-base-content">{{ title }}</h3>
      </div>
    </div>
    
    <div class="flex-1 flex flex-col p-4 overflow-y-auto">
      <!-- Full Text Mode -->
      <div v-if="mode === 'full'" class="flex flex-col max-w-4xl">
        <div v-if="fullText" 
             class="reading-text text-base-content leading-relaxed space-y-4 flex-1 overflow-y-auto"
             v-html="displayFullText">
        </div>
        <div v-else class="text-base-content/40 italic flex-1 flex items-center justify-center">
          {{ emptyMessage }}
        </div>
      </div>

      <!-- Paragraph Mode -->
      <div v-else class="space-y-6">
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
        />
        
        <!-- Add Paragraph Button -->
        <div class="flex justify-center pt-4">
          <button
            @click="editor.addParagraph(paragraphs.length, type)"
            class="btn btn-outline btn-sm flex items-center space-x-2"
            title="Add new paragraph"
          >
            <span class="text-lg">+</span>
            <span>Add Paragraph</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '../store';
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
}

const props = withDefaults(defineProps<Props>(), {
  showBorder: false,
  showEditButton: false,
  emptyMessage: 'No content yet',
  placeholder: 'Enter content...',
  isHighlightEnabled: false,
});

const editor = useEditorStore();

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

</script>