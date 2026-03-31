/**
 * Error Store - Centralized error modal management
 * 
 * Provides global state for displaying error modals to users.
 * Used by APIClient and other modules to show user-friendly error messages.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useErrorStore = defineStore('error', () => {
  // State
  const showErrorModal = ref(false);
  const errorMessage = ref('');
  const errorDetails = ref('');

  // Actions
  function openErrorModal(message: string, details?: string) {
    errorMessage.value = message;
    errorDetails.value = details || '';
    showErrorModal.value = true;
  }

  function closeErrorModal() {
    showErrorModal.value = false;
    // Optionally clear after animation
    setTimeout(() => {
      errorMessage.value = '';
      errorDetails.value = '';
    }, 300);
  }

  // Return state and actions
  return {
    // State
    showErrorModal,
    errorMessage,
    errorDetails,

    // Actions
    openErrorModal,
    closeErrorModal,
  };
});