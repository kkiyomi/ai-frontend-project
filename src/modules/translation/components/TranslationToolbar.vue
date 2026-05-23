<!--
  TranslationToolbar - Toolbar with translation actions

  Provides controls for translation operations with mode selection:
  - Full Auto (one-click extract + translate)
  - Two-Step (extract first, then translate with reviewed terms)
-->
<template>
  <div class="flex items-center space-x-2">
    <!-- Mode A: Direct "Translate Now" split button (no fresh extraction yet) -->
    <div
      v-if="showTranslateNowButton && !hasFreshExtraction"
      class="dropdown dropdown-end"
    >
      <div class="join">
        <button
          @click="translateNow('full')"
          :disabled="store.isTranslating || disabled"
          class="btn btn-secondary btn-sm join-item disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="store.isTranslating" class="loading loading-spinner loading-xs" />
          {{ store.isTranslating ? 'Translating…' : 'Translate Now' }}
        </button>
        <button
          class="btn btn-secondary btn-sm join-item dropdown-toggle px-2"
          tabindex="0"
          :disabled="store.isTranslating || disabled"
        >
          ▾
        </button>
      </div>
      <ul
        tabindex="0"
        class="dropdown-content menu bg-base-100 rounded-box z-10 w-64 p-2 shadow-sm"
      >
        <li>
          <a @click="translateNow('full')" class="flex flex-col items-start gap-0">
            <span>Full Auto Translate</span>
            <span class="text-xs text-base-content/40">Extract + translate in one step</span>
          </a>
        </li>
        <li>
          <a @click="translateNow('extract_only')" class="flex flex-col items-start gap-0">
            <span>Extract Glossary First…</span>
            <span class="text-xs text-base-content/40">Review terms before translating</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- Mode B post-extraction state -->
    <template v-if="showTranslateNowButton && hasFreshExtraction">
      <button
        @click="translateNow('translate_only')"
        :disabled="store.isTranslating || disabled"
        class="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Translate with Reviewed Terms
      </button>
    </template>

    <!-- Existing retranslate / clear buttons (unchanged) -->
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
import { computed } from 'vue';
import { useTranslationStore } from '../store';
import { useBillingStore } from '@/modules/billing';
import type { TranslationMode } from '../types';

const store = useTranslationStore();
const billingStore = useBillingStore();

interface Props {
  chapterId?: string | null;
  disabled?: boolean;
  showTranslateNowButton?: boolean;
  showRetranslateButton?: boolean;
  showClearButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  chapterId: null,
  disabled: false,
  showTranslateNowButton: true,
  showRetranslateButton: false,
  showClearButton: false,
});

defineEmits<{
  retranslate: [];
  clear: [];
}>();

const hasFreshExtraction = computed(() => {
  if (!props.chapterId) return false;
  const state = store.chapterStates[props.chapterId];
  return state?.hasFreshExtraction ?? false;
});

const translateNow = async (mode: TranslationMode = 'full') => {
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
    const result = await store.translateChapterStream(chapterId, mode);

    if (result) {
      console.log(`Streaming ${mode} started:`, result.jobId);
    }
  } catch (error) {
    console.error(`Error starting ${mode}:`, error);
  }
};
</script>
