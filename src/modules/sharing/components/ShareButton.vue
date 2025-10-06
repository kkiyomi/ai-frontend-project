<template>
  <button
    @click="openShareModal"
    :disabled="!hasContent"
    class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
    :title="hasContent ? 'Share your translations' : 'No content to share'"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
    <span>Share</span>
  </button>
  
  <ShareModal
    v-if="showModal"
    :series="series"
    @close="closeShareModal"
    @share="handleShare"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSharingStore } from '../store';
import { sharingAPI } from '../api';
import ShareModal from './ShareModal.vue';
import type { ShareRequest } from '../types';
import type { Chapter, Series } from '@/types';

interface Props {
  chapters: Chapter[];
  series: Series[];
}

const props = defineProps<Props>();

const sharingStore = useSharingStore();

const showModal = ref(false);

const hasContent = computed(() => {
  return props.chapters.some(chapter =>
    chapter.translatedContent
  );
});

const openShareModal = () => {
  if (hasContent.value) {
    showModal.value = true;
  }
};

const closeShareModal = () => {
  showModal.value = false;
};

const handleShare = async (shareRequest: ShareRequest) => {
  try {
    sharingStore.setCreatingShare(true);
    sharingStore.setShareError(null);

    const result = await sharingAPI.createShare(shareRequest);

    if (result.success && result.data) {
      await navigator.clipboard.writeText(result.data.shareUrl);
      console.log('Share link copied to clipboard:', result.data.shareUrl);
    } else {
      sharingStore.setShareError(result.error || 'Failed to create share');
    }

    closeShareModal();
  } catch (error) {
    console.error('Failed to create share:', error);
    sharingStore.setShareError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    sharingStore.setCreatingShare(false);
  }
};
</script>