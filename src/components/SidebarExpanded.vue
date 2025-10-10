<template>
    <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 flex-shrink-0">
            <h1 class="text-xl font-bold text-gray-900 mb-2">Translation Tool</h1>
            <p class="text-sm text-gray-600">Upload and manage your novel chapters</p>
        </div>

        <!-- Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto min-h-0 pb-4">
            <ChaptersSection />
        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
            <button v-if="currentSeriesId" @click="$emit('toggle-glossary')"
                class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{{ isGlossaryVisible ? "Hide" : "Show" }} Glossary</span>
            </button>

            <div class="mt-3 text-center">
                <p class="text-xs text-gray-500">{{ getTotalStats() }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ChaptersSection from './ChaptersSection.vue';
import { useSeriesStore } from '@/modules/series';
import { useChaptersStore } from '@/modules/chapters';

interface Props {
    isGlossaryVisible: boolean;
}

defineProps<Props>();
defineEmits<{
    'toggle-glossary': [];
}>();

const seriesStore = useSeriesStore();
const chaptersStore = useChaptersStore();

const series = computed(() => seriesStore.series);
const currentSeriesId = computed(() => seriesStore.selectedSeriesId);

const getTotalStats = (): string => {
    const allChapters = chaptersStore.chapters;

    const totalParagraphs = allChapters.reduce(
        (sum, chapter) => sum + chapter.originalParagraphs.length,
        0
    );

    const translatedParagraphs = allChapters.reduce(
        (sum, chapter) => sum + chapter.translatedParagraphs.filter((p) => p.trim()).length,
        0
    );

    if (totalParagraphs === 0) return "No content yet";
    return `${series.value.length} series • ${translatedParagraphs}/${totalParagraphs} paragraphs translated`;
};
</script>