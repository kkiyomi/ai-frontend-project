export { useSeriesStore } from './store';
export { seriesAPI } from './api';
export type { Series, CreateSeriesRequest, UpdateSeriesRequest, SeriesState } from './types';
export { default as SeriesCard } from './components/SeriesCard.vue';
export { default as SeriesEditModal } from './components/SeriesEditModal.vue';

// Export functionality
export { useSeriesExporter } from './composables/useSeriesExporter';
export type { ExportSeries } from './composables/useSeriesExporter';
