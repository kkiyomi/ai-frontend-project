<template>
  <div class="relative">
    <button
      @click="toggleMenu"
      :disabled="!hasContent"
      class="btn btn-success btn-sm space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      :title="hasContent ? 'Export' : 'No content to export'"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Export</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown -->
    <div
      v-if="open"
      class="absolute right-0 mt-2 w-64 bg-base-100 rounded-lg shadow-lg border border-base-300 py-2 z-50"
      @click.stop
    >
      <!-- Series Export -->
      <div v-if="series" class="px-3 py-2 border-b border-base-200">
         <h4 class="text-sm font-medium text-base-content mb-2">Series Export</h4>
        <div class="space-y-1">
           <button
             @click="exportSeriesAsZip"
             :disabled="seriesExporter.isExporting.value"
             class="btn btn-ghost btn-sm justify-start w-full text-base-content hover:bg-base-200 disabled:opacity-50"
          >
            Export current series
          </button>
           <button
             v-if="allSeries && allSeries.length > 0"
             @click="exportAllSeriesAsZip"
             :disabled="seriesExporter.isExporting.value"
             class="btn btn-ghost btn-sm justify-start w-full text-base-content hover:bg-base-200 disabled:opacity-50"
          >
            Export all series ({{ allSeries.length }} series)
          </button>
        </div>
      </div>

      <!-- Status -->
      <div v-if="seriesExporter.isExporting.value || seriesExporter.error.value" class="px-3 py-2 border-t border-base-200">
         <div v-if="seriesExporter.isExporting.value" class="flex items-center space-x-2 text-info text-xs">
           <div class="animate-spin h-3 w-3 border border-info border-t-transparent rounded-full"></div>
          <span>Exporting series...</span>
        </div>
        
         <div v-else-if="seriesExporter.error.value" class="text-xs text-error">
          Series export failed: {{ seriesExporter.error.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useSeriesWithChapters, useExporter } from "@/composables";

const seriesExporter = useExporter();

const {
  selectedSeriesWithChapters: series,
  allSeriesWithChapters: allSeries,
} = useSeriesWithChapters();

const open = ref(false);

const chapters = computed(() => series.value?.chapters || []);

const hasContent = computed(() =>
  chapters.value.some(ch =>
    ch.translatedParagraphs.some((p: string) => p.trim())
  )
);

const toggleMenu = () => {
  if (!hasContent.value) return;
  open.value = !open.value;
};

const handleClickOutside = (e: MouseEvent) => {
  if (!open.value) return;
  const target = e.target as HTMLElement;
  if (!target.closest(".relative")) open.value = false;
};

const exportSeriesAsZip = async () => {
  try {
    if (!series.value) return;
    seriesExporter.clearError();
    await seriesExporter.exportSeriesAsZip([series.value], {
      filename: `series-${series.value.name.replace(/[^a-zA-Z0-9]/g, '-')}`,
      timestamp: true,
    });
    open.value = false;
  } catch (err) {
    console.error(err);
    open.value = false;
  }
};

const exportAllSeriesAsZip = async () => {
  try {
    if (!allSeries.value || allSeries.value.length === 0) return;
    seriesExporter.clearError();
    await seriesExporter.exportSeriesAsZip(allSeries.value, {
      filename: 'all-series',
      timestamp: true,
    });
    open.value = false;
  } catch (err) {
    console.error(err);
    open.value = false;
  }
};

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
</script>
