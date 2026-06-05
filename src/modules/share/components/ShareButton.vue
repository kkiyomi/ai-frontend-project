<template>
  <button
    @click.stop="openDialog"
    class="btn btn-ghost btn-xs btn-circle p-1 text-base-content/40 hover:text-primary transition-colors"
    :title="`Share ${contentType}`"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  </button>

  <ShareDialog
    v-if="showDialog"
    :content-type="contentType"
    :content-id="contentId"
    :content-title="contentTitle"
    @close="showDialog = false"
    @created="onCreated"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ShareDialog from './ShareDialog.vue';

interface Props {
  contentType: 'chapter' | 'series';
  contentId: string;
  contentTitle?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  created: [uuid: string];
}>();

const showDialog = ref(false);

function openDialog() {
  showDialog.value = true;
}

function onCreated(uuid: string) {
  showDialog.value = false;
  emit('created', uuid);
}
</script>
