<template>
    <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-4 flex-shrink-0" style="border-bottom: 1px solid var(--color-border);">
            <h1 class="text-xl font-bold mb-2" style="color: var(--color-text);">Translation Tool</h1>
            <p class="text-sm" style="color: var(--color-textSecondary);">Upload and manage your novel chapters</p>
        </div>

        <!-- Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto min-h-0 pb-4">
            <!-- <FileUploadSection /> -->
            <ChaptersSection />
        </div>

        <!-- Footer Actions -->
        <div class="p-4 flex-shrink-0" style="border-top: 1px solid var(--color-border); background-color: var(--color-surface);">
            <div class="space-y-2">
                <button @click="$emit('toggle-glossary')"
                    class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>{{ isGlossaryVisible ? "Hide" : "Show" }} Glossary</span>
                </button>

                <button @click="$emit('cycle-theme')"
                    class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>{{ currentThemeConfig.name }} Theme</span>
                </button>
            </div>

            <div class="mt-3 text-center">
                <p class="text-xs" style="color: var(--color-textSecondary);">{{ getTotalStats() }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import FileUploadSection from './FileUploadSection.vue';
import ChaptersSection from './ChaptersSection.vue';
import { useChapters } from '../composables/useChapters';

interface Props {
    isGlossaryVisible: boolean;
    currentThemeConfig: {
        name: string;
    };
}

defineProps<Props>();
defineEmits<{
    'toggle-glossary': [];
    'cycle-theme': [];
}>();

const { series } = useChapters();

const getTotalStats = (): string => {
    const totalParagraphs = series.value.reduce(
        (sum, s) => sum + s.chapters.reduce((chSum, chapter) => chSum + chapter.paragraphs.length, 0),
        0
    );
    const translatedParagraphs = series.value.reduce(
        (sum, s) => sum + s.chapters.reduce(
            (chSum, chapter) => chSum + chapter.paragraphs.filter((p) => p.translatedText.trim()).length,
            0
        ),
        0
    );

    if (totalParagraphs === 0) return "No content yet";
    return `${series.value.length} series • ${translatedParagraphs}/${totalParagraphs} paragraphs translated`;
};
</script>