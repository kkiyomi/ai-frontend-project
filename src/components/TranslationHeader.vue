<template>
  <div class="border-b border-secondary-200 p-4">
    <div class="flex items-center justify-between gap-4">

      <!-- Left: Chapter Information -->
      <div class="flex-1 min-w-0">
        <template v-if="currentChapter">
          <h2 class="text-lg font-semibold text-secondary-900 truncate">
            {{ currentChapter.title }}
          </h2>
          <p class="text-sm text-secondary-500">
            {{ currentChapter.originalParagraphs.length }} originals
            <span v-if="currentChapter.translatedParagraphs.length">
              • {{ currentChapter.translatedParagraphs.length }} translated
            </span>
          </p>
        </template>

        <p v-else class="text-secondary-500">
          Select a chapter to begin.
        </p>
      </div>

      <!-- Middle: Action Buttons -->
      <div v-if="currentChapter" class="flex items-center space-x-2">

        <ShareButton :chapters="allChapters" :series="allSeries" />

        <!-- Export Dropdown -->
        <ExportButton
          v-if="currentChapter"
          :chapters="allChapters"
          :currentChapter="currentChapter"
        />

        <!-- Layout Toggle -->
        <button
          @click="editor.toggleLayoutMode()"
          class="flex items-center bg-gray-200 rounded-full p-1 space-x-1"
          title="Toggle layout"
        >
          <!-- Split icon -->
          <div
            :class="editor.layoutMode === 'split'
              ? 'bg-blue-600 text-white rounded-full p-1'
              : 'text-gray-400 p-1 hover:bg-gray-100 rounded-full'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M4 8l4-4 4 4M4 16l4 4 4-4M20 8l-4-4-4 4M20 16l-4 4-4-4"/>
            </svg>
          </div>

          <!-- Full icon -->
          <div
            :class="editor.layoutMode === 'full'
              ? 'bg-blue-600 text-white rounded-full p-1'
              : 'text-gray-400 p-1 hover:bg-gray-100 rounded-full'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="8" height="8" rx="1"/>
              <rect x="13" y="3" width="8" height="8" rx="1"/>
              <rect x="3" y="13" width="8" height="8" rx="1"/>
              <rect x="13" y="13" width="8" height="8" rx="1"/>
            </svg>
          </div>
        </button>

        <!-- Content Toggle -->
        <button
          @click="editor.toggleContentMode()"
          class="flex items-center bg-gray-200 rounded-full p-1 space-x-1"
          title="Toggle content"
        >
          <!-- Eye icon -->
          <div
            :class="editor.contentMode === 'all'
              ? 'bg-blue-600 text-white rounded-full p-1'
              : 'text-gray-400 p-1 hover:bg-gray-100 rounded-full'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>

          <!-- EyeSlash icon -->
          <div
            :class="editor.contentMode === 'translated'
              ? 'bg-blue-600 text-white rounded-full p-1'
              : 'text-gray-400 p-1 hover:bg-gray-100 rounded-full'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M3 3l18 18M10.477 10.485a3 3 0 014.03 4.028M6.564 6.564C4.43 8.223 3 12 3 12s3.75 7.5 9.75 7.5c2.017 0 3.81-.572 5.33-1.5"/>
            </svg>
          </div>
        </button>

        <!-- Translate All -->
        <button
          @click="translateAllParagraphs"
          :disabled="isTranslating"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md text-sm font-semibold
                 transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isTranslating">Translating…</span>
          <span v-else>Translate All</span>
        </button>

      </div>

      <!-- Right: Avatar -->
      <AvatarMenu @logout="handleLogout" />
    </div>

    <!-- Progress Bar -->
    <div v-if="isTranslating" class="mt-3">
      <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          class="bg-blue-600 h-full rounded-full transition-all duration-300"
          :style="{ width: `${translationProgress}%` }"
        ></div>
      </div>
      <p class="text-sm text-gray-600 mt-2 font-medium">
        {{ Math.round(translationProgress) }}% complete
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

import ExportButton from './ExportButton.vue';
import { ShareButton } from "@/modules/sharing";
import { AvatarMenu, useProfileStore } from "@/modules/profile";
import { useChaptersStore } from "@/modules/chapters";
import { useSeriesStore } from "@/modules/series";
import { useEditorStore } from "@/modules/editor";
import { useTranslationStore } from "@/modules/translation";
import type { ExportFormat } from "@/modules/core";

const chaptersStore = useChaptersStore();
const seriesStore = useSeriesStore();
const editor = useEditorStore();
const profile = useProfileStore();

const {
  isTranslating,
  translationProgress,
  translateParagraph,
} = useTranslationStore();

const currentChapter = computed(() => chaptersStore.currentChapter);
const allChapters = computed(() => chaptersStore.chapters);

const allSeries = computed(() =>
  seriesStore.series.map((s) => ({
    ...s,
    chapters: chaptersStore.getChaptersBySeriesId(s.id),
  }))
);

const hasTranslatedContent = computed(() => {
  return allChapters.value.some(chapter =>
    chapter.translatedParagraphs.some(p => p.trim())
  );
});

const translatedChaptersCount = computed(() => {
  return allChapters.value.filter(chapter =>
    chapter.translatedParagraphs.some(p => p.trim())
  ).length;
});

const translateAllParagraphs = async () => {
  if (!currentChapter.value) return;

  try {
    const fullText = currentChapter.value.content;
    const translatedText = await translateParagraph(fullText);

    const updatedChapter = {
      translatedContent: translatedText,
    };
    await chaptersStore.updateChapter(currentChapter.value.id, updatedChapter);
  } catch (error) {
    console.error('Error translating all paragraphs:', error);
  }
};

const handleLogout = async () => {
  try {
    await profile.logout();
    // Handle post-logout logic here if needed
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>