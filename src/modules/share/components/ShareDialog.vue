<template>
  <div class="modal modal-open" @click.self="$emit('close')">
    <div class="modal-box max-w-md">
      <h3 class="text-lg font-bold mb-4">
        Share {{ contentType === 'chapter' ? 'Chapter' : 'Series' }}
      </h3>

      <p v-if="contentTitle" class="text-sm text-base-content/60 mb-4">
        "{{ contentTitle }}"
      </p>

      <!-- Options -->
      <div class="space-y-3 mb-6">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="includeGlossary"
            type="checkbox"
            class="checkbox checkbox-sm"
          />
          <span class="text-sm">Include glossary annotations</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="includeRaw"
            type="checkbox"
            class="checkbox checkbox-sm"
          />
          <span class="text-sm">Include raw/source content</span>
        </label>
      </div>

      <!-- Generated link -->
      <div v-if="generatedUrl" class="space-y-3">
        <div class="text-sm font-medium text-success">Link generated!</div>
        <div class="flex gap-2">
          <input
            :value="generatedUrl"
            readonly
            class="input input-bordered input-sm flex-1 text-xs font-mono"
            @focus="($event) => ($event.target as HTMLInputElement).select()"
          />
          <button
            @click="copyLink"
            class="btn btn-sm btn-outline"
            :class="{ 'btn-success': copied }"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <p class="text-xs text-base-content/50">
          Anyone with this link can view the content. No login required.
        </p>
      </div>

      <!-- Actions -->
      <div class="modal-action">
        <button v-if="!generatedUrl" class="btn btn-primary btn-sm" :disabled="creating" @click="createLink">
          <span v-if="creating" class="loading loading-spinner loading-xs"></span>
          Generate Link
        </button>
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">
          {{ generatedUrl ? 'Done' : 'Cancel' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useShareStore } from '../store';

interface Props {
  contentType: 'chapter' | 'series';
  contentId: string;
  contentTitle?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  created: [uuid: string];
}>();

const store = useShareStore();

const includeGlossary = ref(false);
const includeRaw = ref(false);
const creating = ref(false);
const generatedUrl = ref('');
const copied = ref(false);

const shareUrl = computed(() => {
  const origin = window.location.origin;
  const uuid = store.links[0]?.uuid || '';
  if (props.contentType === 'chapter') {
    return `${origin}/s/chapter/${uuid}`;
  }
  return `${origin}/s/${uuid}`;
});

async function createLink() {
  creating.value = true;
  try {
    const link = await store.createShareLink({
      publishType: props.contentType,
      contentId: props.contentId,
      includeGlossary: includeGlossary.value,
      includeRaw: includeRaw.value,
    });

    if (link) {
      const origin = window.location.origin;
      generatedUrl.value = props.contentType === 'chapter'
        ? `${origin}/s/chapter/${link.uuid}`
        : `${origin}/s/${link.uuid}`;
      emit('created', link.uuid);
    }
  } finally {
    creating.value = false;
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(generatedUrl.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // Fallback: select the input text
    const input = document.querySelector<HTMLInputElement>('.modal-box input[readonly]');
    input?.select();
  }
}
</script>
