import { ref } from 'vue';
import type { ShareRequest, ShareResponse, SharedContent, APIResponse } from '../types';
import { useAPI } from './useAPI';

const isLoading = ref(false);
const error = ref<string | null>(null);

export function useSharing() {
  const { createShare: createShareAPI, getSharedContent: getSharedContentAPI, deleteShare: deleteShareAPI } = useAPI();

  const createShare = async (request: ShareRequest): Promise<APIResponse<ShareResponse>> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await createShareAPI(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create share';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      isLoading.value = false;
    }
  };

  const getSharedContent = async (shareId: string): Promise<APIResponse<SharedContent>> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await getSharedContentAPI(shareId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load shared content';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteShare = async (shareId: string): Promise<APIResponse<void>> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await deleteShareAPI(shareId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete share';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    createShare,
    getSharedContent,
    deleteShare
  };
}