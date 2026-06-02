<template>
  <div class="flex-1 flex flex-col" :class="{ 'border-r border-base/30': showBorder }">
    <div class="p-4 border-b border-base/30 bg-base/10">
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-base-content">{{ title }}</h3>
      </div>
    </div>
    
    <div ref="columnContent" class="flex-1 flex flex-col p-4 overflow-y-auto" @scroll="onColumnScroll">
      <!-- Full Text Mode -->
      <div v-if="mode === 'full'" class="flex flex-col max-w-4xl">
        <div v-if="fullText" 
             class="reading-text text-base-content leading-relaxed space-y-4 flex-1"
             v-html="displayFormattedFullText">
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
          :highlightedContent="highlightedParagraphs[index]"
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
import { computed, ref, watch, nextTick } from 'vue';
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
  highlightTermsInTexts?: (texts: string[]) => string[];
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

const highlightedParagraphs = computed(() => {
  if (!props.isHighlightEnabled) return props.paragraphs;
  
  // Use batch API if available
  if (props.highlightTermsInTexts) {
    const result = props.highlightTermsInTexts(props.paragraphs);
    // Safety check: ensure result length matches input
    if (result.length === props.paragraphs.length) {
      return result;
    }
    console.warn('highlightTermsInTexts returned array of different length');
  }
  
  // Fallback to single text API
  if (props.highlightTermsInText) {
    return props.paragraphs.map(p => props.highlightTermsInText!(p));
  }
  
  return props.paragraphs;
});

const displayFormattedFullText = computed(() => {
  let fullText = props.fullText;

  if (!fullText) return '';

  fullText = fullText.replace(/\n+/g, "<br>");
  
  if (props.isHighlightEnabled) {
    // Use batch API if available (single element array)
    if (props.highlightTermsInTexts) {
      const result = props.highlightTermsInTexts([fullText]);
      return result[0] || fullText;
    }
    
    // Fallback to single text API
    if (props.highlightTermsInText) {
      return props.highlightTermsInText(fullText);
    }
  }
  
  return fullText;
});

// ── Auto-scroll for streaming content ──────────────────────────────────────
// Scrolls to bottom on new content only if the user is already at the bottom.
// If the user has scrolled up to read earlier content, we stay put.

const columnContent = ref<HTMLElement | null>(null);
const isAtBottom = ref(true);
const SCROLL_THRESHOLD = 40; // px from bottom considered "at bottom"

function onColumnScroll() {
  const el = columnContent.value;
  if (!el) return;
  isAtBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
}

function scrollToBottom() {
  const el = columnContent.value;
  if (!el) return;
  nextTick(() => {
    el.scrollTop = el.scrollHeight;
  });
}

watch(
  () => props.fullText,
  () => {
    if (props.mode === 'full' && isAtBottom.value) {
      scrollToBottom();
    }
  },
);
</script>