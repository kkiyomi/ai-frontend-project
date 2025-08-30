<template>
    <div class="p-4">
        <!-- Header with count -->
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900">Chapters</h3>
            <span class="text-xs text-gray-500">{{ chapters.length }}</span>
        </div>

        <!-- Empty State -->
        <div v-if="chapters.length === 0" class="text-center py-8">
            <div class="text-4xl mb-3">📖</div>
            <p class="text-sm text-gray-500">No chapters uploaded yet</p>
        </div>

        <!-- Chapters List -->
        <div v-else class="space-y-2">
            <div v-for="chapter in chapters" :key="chapter.id" @click="selectChapter(chapter.id)"
                class="group relative p-3 rounded-lg border border-gray-200 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50"
                :class="{
                    'border-blue-500 bg-blue-50': currentChapterId === chapter.id,
                    'hover:shadow-sm': currentChapterId !== chapter.id,
                }">
                <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="text-lg">{{ getFileIcon(chapter.title) }}</span>
                            <h4 class="text-sm font-medium text-gray-900 truncate">
                                {{ chapter.title }}
                            </h4>
                        </div>
                        <p class="text-xs text-gray-500">
                            {{ chapter.paragraphs.length }} paragraphs
                        </p>
                        <div class="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                            <span>{{ getTranslationProgress(chapter) }}% translated</span>
                            <span>{{ formatFileSize(chapter.content.length) }}</span>
                        </div>
                    </div>

                    <button @click.stop="removeChapter(chapter.id)"
                        class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        title="Remove chapter">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Progress Bar -->
                <div class="mt-2">
                    <div class="bg-gray-200 rounded-full h-1">
                        <div class="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            :style="{ width: `${getTranslationProgress(chapter)}%` }" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { useChapters } from '../composables/useChapters';
import { getFileIcon } from '../utils/fileParser';
import type { Chapter } from '../types';

const { chapters, currentChapterId, selectChapter, removeChapter } = useChapters();

const getTranslationProgress = (chapter: Chapter): number => {
    if (chapter.paragraphs.length === 0) return 0;
    const translatedCount = chapter.paragraphs.filter((p) =>
        p.translatedText.trim()
    ).length;
    return Math.round((translatedCount / chapter.paragraphs.length) * 100);
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
</script>