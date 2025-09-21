<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="handleBackdropClick">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full"
             :class="iconBgClass">
          <svg class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
          </svg>
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        </div>
      </div>

      <div class="mb-6">
        <p class="text-sm text-gray-600">{{ message }}</p>
        <p v-if="details" class="text-xs text-gray-500 mt-2">{{ details }}</p>
      </div>

      <div class="flex items-center justify-end space-x-3">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {{ cancelText }}
        </button>
        <button
          @click="$emit('confirm')"
          :disabled="isProcessing"
          class="px-4 py-2 rounded-lg transition-colors font-medium"
          :class="confirmButtonClass"
        >
          {{ isProcessing ? processingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title: string;
  message: string;
  details?: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  processingText?: string;
  isProcessing?: boolean;
  allowBackdropClose?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'danger',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  processingText: 'Processing...',
  isProcessing: false,
  allowBackdropClose: true,
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-100';
    case 'warning':
      return 'bg-yellow-100';
    case 'info':
      return 'bg-blue-100';
    default:
      return 'bg-red-100';
  }
});

const iconClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'text-red-600';
    case 'warning':
      return 'text-yellow-600';
    case 'info':
      return 'text-blue-600';
    default:
      return 'text-red-600';
  }
});

const iconPath = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z';
    case 'warning':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z';
    case 'info':
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    default:
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z';
  }
});

const confirmButtonClass = computed(() => {
  const baseClass = 'disabled:opacity-50 disabled:cursor-not-allowed';
  switch (props.type) {
    case 'danger':
      return `${baseClass} bg-red-600 text-white hover:bg-red-700`;
    case 'warning':
      return `${baseClass} bg-yellow-600 text-white hover:bg-yellow-700`;
    case 'info':
      return `${baseClass} bg-blue-600 text-white hover:bg-blue-700`;
    default:
      return `${baseClass} bg-red-600 text-white hover:bg-red-700`;
  }
});

const handleBackdropClick = () => {
  if (props.allowBackdropClose && !props.isProcessing) {
    emit('cancel');
  }
};
</script>