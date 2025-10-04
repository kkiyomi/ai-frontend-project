import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { seriesAPI } from './api';
import type { Series, CreateSeriesRequest, UpdateSeriesRequest } from './types';

/**
 * Series Store - manages series state using Pinia
 *
 * HOW TO USE IN COMPONENTS:
 *
 * 1. Import the store:
 *    import { useSeriesStore } from '@/modules/series';
 *
 * 2. Use in setup():
 *    const seriesStore = useSeriesStore();
 *
 * 3. Access state:
 *    - seriesStore.series (all series)
 *    - seriesStore.selectedSeries (currently selected series)
 *    - seriesStore.loading (loading state)
 *    - seriesStore.error (error message)
 *
 * 4. Call actions:
 *    await seriesStore.fetchSeries();
 *    await seriesStore.createSeries({ name: 'My Series', description: 'Description' });
 *    await seriesStore.updateSeries('s1', { name: 'New Name' });
 *    await seriesStore.deleteSeries('s1');
 *    seriesStore.selectSeries('s1');
 *
 * TOGGLE BETWEEN MOCK AND REAL API:
 *
 * The store automatically uses the configured API (mock or real).
 * To switch between them, modify src/modules/core/utils/environment.ts:
 * - Set `useMockAPI = true` for mock data
 * - Set `useMockAPI = false` for real backend
 *
 * The store doesn't need any changes - it just calls the API methods
 * and the API layer handles the mock/real switching automatically.
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
        series.value.push(response.data);
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
