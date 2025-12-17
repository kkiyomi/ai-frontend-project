import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { seriesAPI } from './api';
import type { Series, CreateSeriesRequest, UpdateSeriesRequest } from './types';

/**
 * Series Module - Pinia Store
 *
 * Manages series state and operations including CRUD operations and series selection.
 * Provides comprehensive error handling, loading states, and computed properties
 * for accessing the currently selected series. Integrates with series API layer
 * with automatic mock/real switching based on environment configuration.
 *
 * Usage Example:
 * ```typescript
 * import { useSeriesStore } from '@/modules/series';
 *
 * const series = useSeriesStore();
 * await series.fetchSeries();
 *
 * // Create a new series
 * await series.createSeries({ name: 'My Series', description: 'Description' });
 *
 * // Select a series
 * series.selectSeries('series-id');
 *
 * // Access selected series
 * console.log(series.selectedSeries?.name);
 * ```
 */

export const useSeriesStore = defineStore('series', () => {
  const series = ref<Series[]>([]);
  const selectedSeriesId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const selectedSeries = computed(() => {
    if (!selectedSeriesId.value) return null;
    return series.value.find(s => s.id === selectedSeriesId.value) || null;
  });

  async function fetchSeries() {
    loading.value = true;
    error.value = null;

    try {
      const response = await seriesAPI.getSeries();

      if (response.success && response.data) {
        series.value = response.data;
      } else {
        error.value = response.error || 'Failed to fetch series';
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  }

  async function fetchSeriesById(seriesId: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await seriesAPI.getSeriesById(seriesId);

      if (response.success && response.data) {
        const index = series.value.findIndex(s => s.id === seriesId);
        if (index !== -1) {
          series.value[index] = response.data;
        } else {
          series.value.push(response.data);
        }
        return response.data;
      } else {
        error.value = response.error || 'Failed to fetch series';
        return null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createSeries(request: CreateSeriesRequest) {
    loading.value = true;
    error.value = null;

    try {
      const response = await seriesAPI.createSeries(request);

      if (response.success && response.data) {
        series.value.unshift(response.data);
        return response.data;
      } else {
        error.value = response.error || 'Failed to create series';
        return null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateSeries(seriesId: string, request: UpdateSeriesRequest) {
    loading.value = true;
    error.value = null;

    try {
      const response = await seriesAPI.updateSeries(seriesId, request);

      if (response.success && response.data) {
        const index = series.value.findIndex(s => s.id === seriesId);
        if (index !== -1) {
          series.value[index] = response.data;
        }
        return response.data;
      } else {
        error.value = response.error || 'Failed to update series';
        return null;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteSeries(seriesId: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await seriesAPI.deleteSeries(seriesId);

      if (response.success) {
        series.value = series.value.filter(s => s.id !== seriesId);
        if (selectedSeriesId.value === seriesId) {
          selectedSeriesId.value = null;
        }
        return true;
      } else {
        error.value = response.error || 'Failed to delete series';
        return false;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function selectSeries(seriesId: string | null) {
    selectedSeriesId.value = seriesId;
  }

  function clearError() {
    error.value = null;
  }

  return {
    series,
    selectedSeriesId,
    selectedSeries,
    loading,
    error,
    fetchSeries,
    fetchSeriesById,
    createSeries,
    updateSeries,
    deleteSeries,
    selectSeries,
    clearError
  };
});
