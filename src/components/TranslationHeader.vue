<template>
  <div class="border-b border-base/30 p-4">
    <div class="flex items-center justify-between gap-4">

      <!-- Left: Chapter Information -->
      <div class="flex-1 min-w-0">
        <template v-if="currentChapter">
          <h2 class="text-lg font-semibold text-base-content truncate">
            {{ currentChapter.title }}
          </h2>
          <p class="text-sm text-base-content/60">
            {{ currentChapter.originalParagraphs.length }} originals
            <span v-if="currentChapter.translatedParagraphs.length">
              • {{ currentChapter.translatedParagraphs.length }} translated
            </span>
          </p>
        </template>

        <p v-else class="text-base-content/60">
          Select a chapter to begin.
        </p>
      </div>

      <!-- Save Status Indicator -->
      <div v-if="currentChapter" class="flex-shrink-0">
        <span v-if="editor.saveStatus === 'saving'" class="badge badge-sm badge-ghost gap-1">
          <span class="loading loading-spinner loading-xs"></span>
          Saving…
        </span>
        <span v-else-if="editor.saveStatus === 'error'" class="badge badge-sm badge-error gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Save failed
        </span>
        <span v-else-if="editor.saveStatus === 'saved'" class="badge badge-sm badge-success gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Saved
        </span>
        <span v-else-if="editor.hasUnsavedChanges" class="badge badge-sm badge-warning gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
          Unsaved changes
        </span>
      </div>

      <!-- Chapter Navigation -->
      <div v-if="currentChapter" class="flex items-center gap-1 flex-shrink-0">
        <button
          class="btn btn-ghost btn-square btn-sm"
          :class="prevChapterId ? '' : 'btn-disabled opacity-30'"
          :disabled="!prevChapterId"
          @click="navigateToChapter(prevChapterId)"
          title="Previous chapter (Left Arrow)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button
          class="btn btn-ghost btn-square btn-sm"
          :class="nextChapterId ? '' : 'btn-disabled opacity-30'"
          :disabled="!nextChapterId"
          @click="navigateToChapter(nextChapterId)"
          title="Next chapter (Right Arrow)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Middle: Action Buttons -->
      <div v-if="currentSeries" class="flex items-center space-x-2">

        <!-- Export Dropdown -->
        <ExportButton
          v-if="currentSeries"
        />

        <!-- Layout Toggle (disabled during streaming — only full mode works) -->
        <label
          v-if="currentChapter"
          class="btn btn-sm swap swap-rotate"
          :class="{ 'opacity-40 pointer-events-none': isTranslating }"
          :title="isTranslating ? 'Not available during translation' : 'Toggle layout'"
        >
          <input
            type="checkbox"
            :checked="editor.layoutMode === 'full'"
            @change="editor.toggleLayoutMode()"
            :disabled="isTranslating"
            autocomplete="off"
          />
          <!-- Icon for Split Mode (Columns/Dual Pane) -->
          <svg class="swap-on w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M4 8l4-4 4 4M4 16l4 4 4-4M20 8l-4-4-4 4M20 16l-4 4-4-4"/>
          </svg>
          <!-- Icon for Full Mode (Wide/Single Text) -->
          <svg class="swap-off w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M3 6h18"></path>
            <path d="M3 10h18"></path>
            <path d="M3 14h18"></path>
            <path d="M3 18h18"></path>
          </svg>
        </label>


        <!-- Content Toggle -->
        <label
          v-if="currentChapter"
          class="btn btn-sm swap swap-rotate"
          title="Toggle content"
        >
          <input
            type="checkbox"
            :checked="editor.contentMode === 'translated'"
            @change="editor.toggleContentMode()"
            autocomplete="off"
          />
          <svg class="swap-on w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <svg class="swap-off w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M3 3l18 18M10.477 10.485a3 3 0 014.03 4.028M6.564 6.564C4.43 8.223 3 12 3 12s3.75 7.5 9.75 7.5c2.017 0 3.81-.572 5.33-1.5"/>
          </svg>
        </label>

        <!-- Translate All Button using TranslationToolbar component -->
        <TranslationToolbar
          v-if="currentChapter"
          :chapterId="currentChapterId"
          :disabled="!currentChapter"
          :hasExistingTerms="hasExistingTerms"
        />

      </div>

      <!-- Right: Avatar -->
      <AvatarMenu @logout="handleLogout" />
    </div>

    <!-- Translation Progress using TranslationProgress component -->
    <TranslationProgress />
    
    <!-- Translation Status using TranslationStatus component -->
    <TranslationStatus />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from 'vue-router';

import ExportButton from './ExportButton.vue';
import { AvatarMenu, useProfileStore } from "@/modules/profile";
import { useChaptersStore } from "@/modules/chapters";
import { useSeriesStore } from "@/modules/series";
import { useEditorStore } from "@/modules/editor";
import { useGlossaryStore } from "@/modules/glossary";
import { useSeriesWithChapters, useChapterNavigation } from '@/composables';

// Import translation module components and store
import { 
  useTranslationStore,
  TranslationProgress,
  TranslationStatus,
  TranslationToolbar
} from "@/modules/translation";

import { useBillingStore } from "@/modules/billing";

const router = useRouter();

const chaptersStore = useChaptersStore();
const seriesStore = useSeriesStore();
const editor = useEditorStore();
const profile = useProfileStore();

const {
  selectedSeriesWithChapters: currentSeries,
} = useSeriesWithChapters();

const { prevChapterId, nextChapterId } = useChapterNavigation();

function navigateToChapter(chapterId: string | null) {
  if (!chapterId) return;
  const seriesId = router.currentRoute.value.params.seriesId as string;
  if (seriesId) {
    router.push(`/series/${seriesId}/chapters/${chapterId}`);
  }
}

/** Arrow key navigation — skips when user is editing a textarea, input, or select. */
function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;
  if ((e.target as HTMLElement)?.isContentEditable) return;

  if (e.key === 'ArrowLeft' && prevChapterId.value) {
    e.preventDefault();
    navigateToChapter(prevChapterId.value);
  } else if (e.key === 'ArrowRight' && nextChapterId.value) {
    e.preventDefault();
    navigateToChapter(nextChapterId.value);
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Use translation store
const translationStore = useTranslationStore();
const billingStore = useBillingStore();
const glossaryStore = useGlossaryStore();

const currentChapter = computed(() => chaptersStore.currentChapter);
const currentChapterId = computed(() => chaptersStore.currentChapterId);
const allChapters = computed(() => chaptersStore.chapters);
const isTranslating = computed(() => translationStore.isTranslating);

/** True when glossary terms exist specifically for the current chapter (survives page reload). */
const hasExistingTerms = computed(() => {
  const chapterId = currentChapterId.value;
  if (!chapterId) return false;
  return glossaryStore.terms.some(
    t => t.chapterId === chapterId || t.chapterIds?.includes(chapterId),
  );
});

// Keep the translation store's currentChapterId in sync with navigation
// so backward-compat getters (isTranslating, translationProgress, etc.)
// always reflect the chapter the user is currently viewing. This allows
// starting translations on multiple chapters independently while the
// header always shows the right chapter's state.
watch(currentChapterId, (id) => {
  translationStore.setCurrentChapterId(id);
}, { immediate: true });

// When translation starts, force full layout mode (split mode doesn't work with streaming)
watch(isTranslating, (translating) => {
  if (translating) {
    editor.layoutMode = 'full';
  }
});

const allSeries = computed(() =>
  seriesStore.series.map((s) => ({
    ...s,
    chapters: chaptersStore.getChaptersBySeriesId(s.id),
  }))
);

const handleLogout = async () => {
  try {
    await profile.logout();
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>
