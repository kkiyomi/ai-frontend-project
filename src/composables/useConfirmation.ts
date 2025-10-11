import { ref } from 'vue';

export function useConfirmation() {
  const show = ref(false);
  const modalData = ref<any>(null);

  const open = (options: {
    title: string;
    message: string;
    details?: string;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    action: () => Promise<void> | void;
  }) => {
    modalData.value = options;
    show.value = true;
  };

  const close = () => {
    show.value = false;
    modalData.value = null;
  };

  return { show, modalData, open, close };
}
