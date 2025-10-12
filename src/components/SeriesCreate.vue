<template>
    <div class="p-4 flex-shrink-0">
        <button
            @click="createSeries"
            :disabled="isCreating"
            class="w-full flex items-center gap-2 px-4 py-2 rounded-md
                   text-sm font-medium text-gray-800 bg-white/50 hover:bg-gray-100 hover:border-gray-400
                   transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"></path>
            </svg>
            <span>{{ isCreating ? 'Creating Series...' : 'New Series' }}</span>
        </button>

        <!-- Creation Progress -->
        <div v-if="isCreating" class="mt-3">
            <div class="bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300 w-2/3"></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Processing...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSeriesStore, type Series } from '@/modules/series';
import { useChaptersStore } from '@/modules/chapters';

const emit = defineEmits<{
  edit: [series: Series];
}>();

const seriesStore = useSeriesStore();
const chaptersStore = useChaptersStore();
const isCreating = ref(false);

const createSeries = async () => {
    if (isCreating.value) return;
    isCreating.value = true;

    try {
        const defaultName = `New Series ${new Date().toLocaleTimeString()}`;
        const response = await seriesStore.createSeries({
            name: defaultName,
            description: '',
        });
        if (response) {
            console.log(`✅ Created series: ${defaultName}`);
            seriesStore.selectSeries(response.id)
            chaptersStore.selectChapter('')
            if (seriesStore.selectedSeries) { emit('edit', seriesStore.selectedSeries)};
        }
    } catch (error) {
        console.error('❌ Error creating series:', error);
        // optional: toast notification
    } finally {
        isCreating.value = false;
    }
};
</script>
