<!--
  TranslationToolbar - Toolbar with translation actions

  Provides controls for translation operations.
-->
<template>
  <div class="flex items-center space-x-2">
    <button
      v-if="showTranslateButton"
      @click="translateAllParagraphs"
      :disabled="store.isTranslating || disabled"
       class="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ store.isTranslating ? 'Translating…' : 'Translate' }}
    </button>

    <button
      v-if="showRetranslateButton"
      @click="$emit('retranslate')"
      :disabled="store.isTranslating || disabled"
       class="btn btn-accent btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Retranslate with Glossary
    </button>

    <button
      v-if="showClearButton"
      @click="$emit('clear')"
      :disabled="store.isTranslating"
       class="btn btn-ghost btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Clear Translation
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTranslationStore } from '../store';
import { useBillingStore } from "@/modules/billing";

const store = useTranslationStore();
const billingStore = useBillingStore();

interface Props {
  chapterId?: string | null;
  disabled?: boolean;
  showTranslateButton?: boolean;
  showRetranslateButton?: boolean;
  showClearButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  chapterId: null,
  disabled: false,
  showTranslateButton: true,
  showRetranslateButton: false,
  showClearButton: false,
});

defineEmits<{
  retranslate: [];
  clear: [];
}>();


const translateAllParagraphs = async () => {
  const chapterId = props.chapterId;
  if (!chapterId) return;

  // Check if the user has access to translation feature
  if (!billingStore.hasFeature('translation')) {
    billingStore.openUpgradeModal({ featureName: 'translation' });
    return;
  }

  // Check if the user has translation tokens available
  if (!billingStore.canConsume('translation_tokens_limit')) {
    billingStore.openLimitUpgradeModal('translation_tokens_limit');
    return;
  }

  try {
    const result = await store.translateChapter(chapterId);

    if (result) {
      console.log('Translation job started:', result.jobId);
      // Polling is now handled automatically by the store
      // No need for setTimeout or manual refresh calls
    }
  } catch (error) {
    console.error('Error starting chapter translation:', error);
  }
};
</script>
