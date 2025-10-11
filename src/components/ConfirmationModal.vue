<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="handleBackdropClick">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full"
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
          @click="handleCancel"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          :disabled="isProcessing"
        >
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
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
import { ref, computed } from 'vue';

interface Props {
  title: string;
  message: string;
  details?: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  processingText?: string;
  allowBackdropClose?: boolean;
  action?: () => Promise<void> | void; // 👈 new: the async action
}

const props = withDefaults(defineProps<Props>(), {
  type: 'danger',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  processingText: 'Processing...',
  allowBackdropClose: true,
});

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const isProcessing = ref(false);

const handleConfirm = async () => {
  if (!props.action) {
    emit('close');
    return;
  }

  isProcessing.value = true;
  try {
    await props.action();
    emit('success');
    emit('close');
  } catch (err) {
    console.error('Error during confirmation action:', err);
  } finally {
    isProcessing.value = false;
  }
};

const handleCancel = () => {
  if (!isProcessing.value) emit('close');
};

const handleBackdropClick = () => {
  if (props.allowBackdropClose && !isProcessing.value) {
    emit('close');
  }
};

// existing computed properties...
const iconBgClass = computed(() => ({
  danger: 'bg-red-100',
  warning: 'bg-yellow-100',
  info: 'bg-blue-100',
}[props.type] || 'bg-red-100'));

const iconClass = computed(() => ({
  danger: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
}[props.type] || 'text-red-600'));

const iconPath = computed(() => ({
  danger: 'M12 9v2m0 4h.01m-6.938 4h13.856...',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856...',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9...',
}[props.type] || 'M12 9v2m0 4h.01m-6.938 4h13.856...'));

const confirmButtonClass = computed(() => {
  const base = 'disabled:opacity-50 disabled:cursor-not-allowed';
  return {
    danger: `${base} bg-red-600 text-white hover:bg-red-700`,
    warning: `${base} bg-yellow-600 text-white hover:bg-yellow-700`,
    info: `${base} bg-blue-600 text-white hover:bg-blue-700`,
  }[props.type] || `${base} bg-red-600 text-white hover:bg-red-700`;
});
</script>
