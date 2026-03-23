<template>
  <div class="relative">
    <button
      @click="toggleMenu"
      :disabled="!hasTranslatedContent"
      class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      :title="hasTranslatedContent ? 'Export translations' : 'No translated content to export'"
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
      class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
      @click.stop
    >
      <!-- Current Chapter -->
      <div class="px-3 py-2 border-b border-gray-100">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Current Chapter</h4>
        <div class="space-y-1">
          <button
            v-for="format in exportFormats"
            :key="`current-${format}`"
            @click="emitExport('current', format)"
            :disabled="exporter.isExporting.value"
            class="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            Export as {{ format.toUpperCase() }}
          </button>
        </div>
      </div>

      <!-- All Translated -->
      <div class="px-3 py-2 border-b border-gray-100">
        <h4 class="text-sm font-medium text-gray-900 mb-2">All Translated Chapters</h4>
        <div class="space-y-1">
          <button
            v-for="format in exportFormats"
            :key="`all-${format}`"
            @click="emitExport('all', format)"
            :disabled="exporter.isExporting.value || translatedChaptersCount === 0"
            class="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            Export {{ translatedChaptersCount }} chapters as {{ format.toUpperCase() }}
          </button>
        </div>
      </div>

      <!-- Series Export -->
      <div v-if="series" class="px-3 py-2 border-b border-gray-100">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Series Export</h4>
        <div class="space-y-1">
          <button
            @click="exportSeriesAsZip"
            :disabled="seriesExporter.isExporting.value"
            class="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            Export current series as ZIP
          </button>
          <button
            v-if="allSeries && allSeries.length > 0"
            @click="exportAllSeriesAsZip"
            :disabled="seriesExporter.isExporting.value"
            class="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            Export all series as ZIP ({{ allSeries.length }} series)
          </button>
        </div>
      </div>

      <!-- Status -->
      <div v-if="exporter.isExporting.value || exporter.lastExportResult.value || exporter.error.value || seriesExporter.isExporting.value || seriesExporter.error.value" class="px-3 py-2 border-t border-gray-100">
        <!-- Chapter exporter status -->
        <div v-if="exporter.isExporting.value" class="flex items-center space-x-2 text-blue-600 text-xs">
          <div class="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></div>
          <span>Exporting chapters...</span>
        </div>
        
        <div v-else-if="exporter.error.value" class="text-xs text-red-600">
          Chapter export failed: {{ exporter.error.value }}
        </div>

        <div v-else-if="exporter.lastExportResult.value?.success" class="text-xs text-green-600">
          ✓ Exported {{ exporter.lastExportResult.value.filename }}
        </div>
        
        <!-- Series exporter status -->
        <div v-if="seriesExporter.isExporting.value" class="flex items-center space-x-2 text-blue-600 text-xs mt-2">
          <div class="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></div>
          <span>Exporting series...</span>
        </div>
        
        <div v-else-if="seriesExporter.error.value" class="text-xs text-red-600 mt-2">
          Series export failed: {{ seriesExporter.error.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useChapterExporter } from "@/modules/chapters";
import { useSeriesWithChaptersExporter } from "@/composables";
import type { ExportFormat } from "@/modules/core";
import type { Chapter, SeriesWithChapters } from '@/types';

const props = defineProps<{
  chapters: Chapter[];
  currentChapter: any | null;
  series?: SeriesWithChapters | null;
  allSeries?: SeriesWithChapters[];
}>();

const exporter = useChapterExporter();
const seriesExporter = useSeriesWithChaptersExporter();

const open = ref(false);
const exportFormats: ExportFormat[] = ["txt"];

const hasTranslatedContent = computed(() =>
  props.chapters.some(ch =>
    ch.translatedParagraphs.some((p: string) => p.trim())
  )
);

const translatedChaptersCount = computed(() =>
  props.chapters.filter(ch =>
    ch.translatedParagraphs.some((p: string) => p.trim())
  ).length
);

const toggleMenu = () => {
  if (!hasTranslatedContent.value) return;
  open.value = !open.value;
};

const emitExport = (type: "current" | "all", format: ExportFormat | "json" | "csv") => {
  handleExport({ type, format });
  open.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  if (!open.value) return;
  const target = e.target as HTMLElement;
  if (!target.closest(".relative")) open.value = false;
};

const handleExport = async ({
  type,
  format,
}: {
  type: "current" | "all" | "stats";
  format: ExportFormat | "json" | "csv";
}) => {
  try {
    if (type === "current") {
      await exporter.exportChapterAsText(props.currentChapter);
    } else if (type === "all") {
      await exporter.exportChaptersAsText(props.chapters);
    }
  } catch (err) {
    console.error(err);
  }
};

const exportSeriesAsZip = async () => {
  try {
    if (!props.series) return;
    seriesExporter.clearError();
    await seriesExporter.exportSeriesAsZip([props.series], {
      filename: `series-${props.series.name.replace(/[^a-zA-Z0-9]/g, '-')}`,
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
    if (!props.allSeries || props.allSeries.length === 0) return;
    seriesExporter.clearError();
    await seriesExporter.exportSeriesAsZip(props.allSeries, {
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
