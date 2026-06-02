<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="handleBackdropClick">
     <div class="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl" @click.stop>
      <div class="flex items-center mb-4">
         <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-error/20">
           <svg class="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="ml-4">
           <h3 class="text-lg font-semibold text-base-content">Error</h3>
        </div>
      </div>

      <div class="mb-6">
         <p class="text-sm text-base-content">{{ message }}</p>
         <p v-if="details" class="text-xs text-base-content/70 mt-2">{{ details }}</p>
      </div>

      <div class="flex items-center justify-end">
        <button
          @click="handleClose"
           class="btn btn-ghost btn-sm"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useErrorStore } from '../store';

const errorStore = useErrorStore();

const show = computed(() => errorStore.showErrorModal);
const message = computed(() => errorStore.errorMessage);
const details = computed(() => errorStore.errorDetails);

const handleClose = () => {
  errorStore.closeErrorModal();
};

const handleBackdropClick = () => {
  errorStore.closeErrorModal();
};
</script>