<!--
  TranslationToolbar - Toolbar with translation actions

  Always-visible split button:
  - Main click → smart Translate Now (auto-picks full / translate_only)
  - Dropdown → Extract Glossary (disabled when terms already exist)
-->
<template>
  <div class="flex items-center space-x-2">
    <!-- Always-visible split button -->
    <div
      v-if="showTranslateNowButton"
      class="dropdown dropdown-end"
    >
      <div class="join">
        <button
          @click="translateNow"
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
        class="dropdown-content menu bg-base-100 rounded-box z-10 w-56 p-2 shadow-sm"
      >
        <li>
          <a
            @click="extractGlossary"
            :class="{ 'opacity-40 pointer-events-none': extractDisabled }"
            class="flex flex-col items-start gap-0"
          >
            <span>Extract Glossary</span>
            <span class="text-xs text-base-content/40">Extract terms only, no translation</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- Retranslate / clear buttons -->
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
  hasExistingTerms?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  chapterId: null,
  disabled: false,
  showTranslateNowButton: true,
  showRetranslateButton: false,
  showClearButton: false,
  hasExistingTerms: false,
});

defineEmits<{
  retranslate: [];
  clear: [];
}>();

/** Extract Glossary dropdown item is disabled when terms already exist. */
const extractDisabled = computed(() => {
  if (!props.chapterId) return false;
  return props.hasExistingTerms;
});

/**
 * Smart Translate Now — auto-picks the right mode:
 * - Terms already exist → translate_only (skip extraction)
 * - No terms            → full (extract + translate)
 */
const translateNow = async () => {
  const chapterId = props.chapterId;
  if (!chapterId) return;

  if (!billingStore.hasFeature('translation')) {
    billingStore.openUpgradeModal({ featureName: 'translation' });
    return;
  }
  if (!billingStore.canConsume('translation_tokens_limit')) {
    billingStore.openLimitUpgradeModal('translation_tokens_limit');
    return;
  }

  const mode: TranslationMode = props.hasExistingTerms ? 'translate_only' : 'full';
  try {
    const result = await store.translateChapterStream(chapterId, mode);
    if (result) {
      console.log(`Streaming ${mode} started:`, result.jobId);
    }
  } catch (error) {
    console.error(`Error starting ${mode}:`, error);
  }
};

/** Extract glossary terms only — no translation. */
const extractGlossary = async () => {
  const chapterId = props.chapterId;
  if (!chapterId || extractDisabled.value) return;
  console.log('[DEBUG] extractGlossary CALLED — chapterId=%s', chapterId);

  if (!billingStore.hasFeature('translation')) {
    billingStore.openUpgradeModal({ featureName: 'translation' });
    return;
  }
  if (!billingStore.canConsume('translation_tokens_limit')) {
    billingStore.openLimitUpgradeModal('translation_tokens_limit');
    return;
  }

  try {
    console.log('[DEBUG] extractGlossary calling translateChapterStream — chapterId=%s mode=extract_only', chapterId);
    const result = await store.translateChapterStream(chapterId, 'extract_only');
    if (result) {
      console.log('[DEBUG] Extraction started — jobId=%s', result.jobId);
    } else {
      console.warn('[DEBUG] extractGlossary — translateChapterStream returned null!');
    }
  } catch (error) {
    console.error('[DEBUG] Error starting extraction:', error);
  }
};
</script>
