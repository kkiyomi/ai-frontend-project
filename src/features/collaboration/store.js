// Collaboration domain store - manages sharing, shared content, statistics
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sharingService } from '../../shared/services/sharingService.js';

export const useCollaborationStore = defineStore('collaboration', () => {
  // State
  const isLoading = ref(false);
  const error = ref(null);

  // Actions
  const createShare = async (request) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await sharingService.createShare(request);
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

  const getSharedContent = async (shareId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await sharingService.getSharedContent(shareId);
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

  const deleteShare = async (shareId) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await sharingService.deleteShare(shareId);
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

  const verifySharePassword = async (shareId, password) => {
    try {
      return await sharingService.verifySharePassword(shareId, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify password';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  return {
    // State
    isLoading,
    error,
    
    // Actions
    createShare,
    getSharedContent,
    deleteShare,
    verifySharePassword,
  };
});

export default useCollaborationStore;