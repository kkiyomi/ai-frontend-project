<template>
  <div class="border-b border-base/30 p-4">
    <div class="flex items-center justify-between gap-4">

      <!-- Left: Chapter Info + Status + Navigation -->
      <div class="flex items-center gap-3 min-w-0">
        <template v-if="currentChapter">
          <div class="min-w-0">
            <h2 class="text-lg font-semibold text-base-content truncate">
              {{ currentChapter.title }}
            </h2>
            <p class="text-sm text-base-content/60">
              {{ currentChapter.originalParagraphs.length }} originals
              <span v-if="currentChapter.translatedParagraphs.length">
                • {{ currentChapter.translatedParagraphs.length }} translated
              </span>
              <!-- Save Status Badge -->
              <span v-if="editor.saveStatus === 'saving'" class="badge badge-sm badge-ghost gap-1 ml-2">
                <span class="loading loading-spinner loading-xs"></span>
                Saving…
              </span>
              <span v-else-if="editor.saveStatus === 'error'" class="badge badge-sm badge-error gap-1 ml-2">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Save failed
              </span>
              <span v-else-if="editor.saveStatus === 'saved'" class="badge badge-sm badge-success gap-1 ml-2">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Saved
              </span>
              <span v-else-if="editor.hasUnsavedChanges" class="badge badge-sm badge-warning gap-1 ml-2">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                Unsaved changes
              </span>
            </p>
          </div>

          <!-- Chapter Navigation -->
          <div class="flex items-center gap-1 flex-shrink-0">
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
        </template>

        <p v-else class="text-base-content/60">
          Select a chapter to begin.
        </p>
      </div>

      <div v-if="currentSeries" class="flex items-center space-x-2">

        <!-- Actions Dropdown (Export / Share / Publish) -->
        <div class="dropdown dropdown-end">
          <button
            tabindex="0"
            :disabled="!currentChapter"
            class="btn btn-ghost btn-sm gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Actions"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
            <span>Actions</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm border border-base-300 mt-2">
            <!-- Export items -->
            <li v-if="currentSeries">
              <a @click="exportCurrentSeries" :class="{ 'disabled opacity-50': seriesExporter.isExporting.value }">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Export current series
              </a>
            </li>
            <li v-if="allSeries && allSeries.length > 0">
              <a @click="exportAllSeries" :class="{ 'disabled opacity-50': seriesExporter.isExporting.value }">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 010 2H6v10h12V6h-3a1 1 0 010-2h4a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"/>
                </svg>
                Export all series ({{ allSeries.length }})
              </a>
            </li>
            <li v-if="allSeries && allSeries.length > 0 || currentSeries">
              <hr class="my-1 border-base-300"/>
            </li>
            <!-- Share -->
            <li v-if="currentChapter">
              <a @click="openShareDialog">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
                Share chapter
              </a>
            </li>
            <li v-if="currentChapter">
              <hr class="my-1 border-base-300"/>
            </li>
            <!-- Publish / Unpublish -->
            <li v-if="currentChapter">
              <a @click="togglePublish">
                <svg v-if="isPublished" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                {{ isPublished ? 'Unpublish' : 'Publish' }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Export status (shown outside dropdown during export) -->
        <span v-if="seriesExporter.isExporting.value" class="loading loading-spinner loading-xs text-info"></span>

        <!-- Layout Toggle (disabled during streaming — only full mode works) -->
        <label
          v-if="currentChapter"
          class="btn btn-square btn-sm swap swap-rotate"
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
          class="btn btn-square btn-sm swap swap-rotate"
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

        <AvatarMenu @logout="handleLogout" />
      </div>
    </div>

    <!-- Translation Progress using TranslationProgress component -->
    <TranslationProgress />
    
    <!-- Translation Status using TranslationStatus component -->
    <TranslationStatus />

    <!-- Share Dialog (opened from Actions dropdown) -->
    <ShareDialog
      v-if="showShareDialog && currentChapter"
      contentType="chapter"
      :contentId="currentChapterId!"
      :contentTitle="currentChapter.title"
      @close="showShareDialog = false"
      @created="showShareDialog = false"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from 'vue-router';

import { ShareDialog, shareAPI } from '@/modules/share';
import { AvatarMenu, useProfileStore } from "@/modules/profile";
import { useChaptersStore } from "@/modules/chapters";
import { useEditorStore } from "@/modules/editor";
import { useGlossaryStore } from "@/modules/glossary";
import { useSeriesWithChapters, useChapterNavigation, useExporter } from '@/composables';

// Import translation module components and store
import { 
  useTranslationStore,
  TranslationProgress,
  TranslationStatus,
  TranslationToolbar
} from "@/modules/translation";

const router = useRouter();

const chaptersStore = useChaptersStore();
const editor = useEditorStore();
const profile = useProfileStore();

const {
  selectedSeriesWithChapters: currentSeries,
  allSeriesWithChapters: allSeries,
} = useSeriesWithChapters();

const seriesExporter = useExporter();

const { prevChapterId, nextChapterId } = useChapterNavigation();

const showShareDialog = ref(false);

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
const glossaryStore = useGlossaryStore();

const currentChapter = computed(() => chaptersStore.currentChapter);
const currentChapterId = computed(() => chaptersStore.currentChapterId);
const isTranslating = computed(() => translationStore.isTranslating);

/** True when glossary terms exist specifically for the current chapter (survives page reload). */
const hasExistingTerms = computed(() => {
  const chapterId = currentChapterId.value;
  if (!chapterId) return false;
  return glossaryStore.terms.some(
    t => t.chapterId === chapterId || t.chapterIds?.includes(chapterId),
  );
});

// --- Publish toggle ---
const isPublished = ref(false);

watch(currentChapter, (ch) => {
  isPublished.value = !!(ch as any)?.isPublished;
}, { immediate: true });

async function togglePublish() {
  const chapterId = currentChapterId.value;
  if (!chapterId) return;
  const newState = !isPublished.value;
  const resp = await shareAPI.toggleChapterPublished(chapterId, newState);
  if (resp.success) {
    isPublished.value = newState;
  }
}

// --- Export functions (used from Actions dropdown) ---
const exportCurrentSeries = async () => {
  if (!currentSeries.value) return;
  seriesExporter.clearError();
  try {
    await seriesExporter.exportSeriesAsZip([currentSeries.value], {
      filename: `series-${currentSeries.value.name.replace(/[^a-zA-Z0-9]/g, '-')}`,
      timestamp: true,
    });
  } catch (err) {
    console.error(err);
  }
};

const exportAllSeries = async () => {
  if (!allSeries.value || allSeries.value.length === 0) return;
  seriesExporter.clearError();
  try {
    await seriesExporter.exportSeriesAsZip(allSeries.value, {
      filename: 'all-series',
      timestamp: true,
    });
  } catch (err) {
    console.error(err);
  }
};

function openShareDialog() {
  showShareDialog.value = true;
}

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

const handleLogout = async () => {
  try {
    await profile.logout();
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>
