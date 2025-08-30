<template>
    <div class="flex flex-col items-center py-4 space-y-4 flex-shrink-0">
        <!-- Main Icon -->
        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        </div>

        <!-- Web Scraper Icon -->
        <button
            class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center hover:bg-purple-200 transition-colors"
            title="Web scraper">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        </button>

        <!-- Upload Icon -->
        <button
            class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            title="Upload files">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
        </button>

        <!-- Chapter Count Badge -->
        <div v-if="chaptersCount > 0"
            class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
            {{ chaptersCount }}
        </div>

        <!-- Glossary Toggle Icon -->
        <button @click="$emit('toggle-glossary')"
            class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition-colors"
            :class="{ 'bg-green-200': isGlossaryVisible }" title="Toggle glossary">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        </button>
    </div>
</template>

<script setup lang="ts">
interface Props {
    chaptersCount: number;
    isGlossaryVisible: boolean;
}

defineProps<Props>();
defineEmits<{
    'toggle-glossary': [];
}>();
</script>