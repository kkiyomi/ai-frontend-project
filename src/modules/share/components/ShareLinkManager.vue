<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold">Shared Links</h3>
      <button
        @click="loadLinks"
        class="btn btn-ghost btn-xs btn-circle"
        title="Refresh"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && store.links.length === 0" class="text-center py-4">
      <span class="loading loading-spinner loading-sm"></span>
    </div>

    <!-- Empty -->
    <div v-else-if="store.links.length === 0" class="text-center py-4">
      <p class="text-xs text-base-content/40">No share links created yet.</p>
      <p class="text-xs text-base-content/30 mt-1">
        Click the share icon on a chapter or series to create one.
      </p>
    </div>

    <!-- Link list -->
    <div v-else class="space-y-2 max-h-64 overflow-y-auto">
      <div
        v-for="link in visibleLinks"
        :key="link.uuid"
        class="flex items-center gap-2 p-2 rounded bg-base-200/50 text-xs"
        :class="{ 'opacity-50': !link.active }"
      >
        <!-- Type badge -->
        <span
          class="badge badge-xs shrink-0"
          :class="link.publishType === 'chapter' ? 'badge-info' : 'badge-accent'"
        >
          {{ link.publishType === 'chapter' ? 'Ch' : 'ToC' }}
        </span>

        <!-- Target name (display or edit) -->
        <span class="flex-1 truncate font-medium">
          <!-- Edit mode -->
          <template v-if="editingUuid === link.uuid">
            <div class="flex items-center gap-1 min-w-0">
              <span class="text-base-content/40 shrink-0">/</span>
              <input
                ref="editInput"
                v-model="editValue"
                type="text"
                placeholder="custom-name"
                class="input input-bordered input-xs flex-1 min-w-0 text-xs font-mono"
                :disabled="savingUuid === link.uuid"
                @input="sanitizeEditValue"
                @keydown.enter="saveCustomName(link.uuid)"
                @keydown.escape="cancelEdit"
              />
              <span
                v-if="savingUuid === link.uuid"
                class="loading loading-spinner loading-xs shrink-0"
              ></span>
            </div>
          </template>
          <!-- Display mode -->
          <template v-else>
            <template v-if="link.customName">
              <span class="text-primary">/{{ link.customName }}</span>
              <span class="text-base-content/30 ml-1">
                ({{ link.chapterName || link.novelName || 'Untitled' }})
              </span>
            </template>
            <template v-else>
              {{ link.name || link.chapterName || link.novelName || 'Untitled' }}
            </template>
          </template>
        </span>

        <!-- Views -->
        <span class="text-base-content/40 shrink-0" :title="`${link.viewCount} views`">
          👁 {{ link.viewCount }}
        </span>

        <!-- Actions -->
        <div class="flex items-center gap-0.5 shrink-0">
          <!-- Editing: save / cancel -->
          <template v-if="editingUuid === link.uuid">
            <button
              @click.stop="saveCustomName(link.uuid)"
              class="btn btn-ghost btn-xs btn-circle p-0.5 text-success"
              :disabled="savingUuid === link.uuid"
              title="Save"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              @click.stop="cancelEdit"
              class="btn btn-ghost btn-xs btn-circle p-0.5"
              :disabled="savingUuid === link.uuid"
              title="Cancel"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </template>

          <!-- Normal: edit / copy / revoke -->
          <template v-else>
            <!-- Edit custom name -->
            <button
              v-if="link.active"
              @click.stop="startEdit(link)"
              class="btn btn-ghost btn-xs btn-circle p-0.5"
              title="Edit custom name"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            <!-- Copy link -->
            <button
              v-if="link.active"
              @click.stop="copyShareUrl(link.uuid, link.publishType, link.customName)"
              class="btn btn-ghost btn-xs btn-circle p-0.5"
              title="Copy link"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>

            <!-- Revoke -->
            <button
              v-if="link.active"
              @click.stop="revoke(link.uuid)"
              class="btn btn-ghost btn-xs btn-circle p-0.5 text-error/60 hover:text-error"
              title="Revoke link"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Revoked badge -->
            <span v-else class="badge badge-xs badge-ghost">Revoked</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Filter toggle -->
    <div v-if="store.links.length > 0" class="flex gap-2 mt-3">
      <button
        v-for="f in filters"
        :key="f.key"
        @click="activeFilter = f.key"
        class="btn btn-xs"
        :class="activeFilter === f.key ? 'btn-active' : 'btn-ghost'"
      >
        {{ f.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useShareStore } from '../store';
import type { ShareLink } from '../types';

const store = useShareStore();

const activeFilter = ref<'all' | 'active' | 'revoked'>('active');
const editingUuid = ref<string | null>(null);
const editValue = ref('');
const savingUuid = ref<string | null>(null);
const editInput = ref<HTMLInputElement[]>([]);

const filters = [
  { key: 'active' as const, label: 'Active' },
  { key: 'revoked' as const, label: 'Revoked' },
  { key: 'all' as const, label: 'All' },
];

const visibleLinks = computed(() => {
  if (activeFilter.value === 'active') {
    return store.links.filter((l) => l.active);
  }
  if (activeFilter.value === 'revoked') {
    return store.links.filter((l) => !l.active);
  }
  return store.links;
});

function loadLinks() {
  store.fetchLinks();
}

async function revoke(uuid: string) {
  await store.revokeLink(uuid);
}

function sanitizeEditValue() {
  editValue.value = editValue.value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function startEdit(link: ShareLink) {
  editingUuid.value = link.uuid;
  editValue.value = link.customName || '';
  nextTick(() => {
    const input = editInput.value?.[0];
    input?.focus();
    input?.select();
  });
}

function cancelEdit() {
  editingUuid.value = null;
  editValue.value = '';
}

async function saveCustomName(uuid: string) {
  const newName = editValue.value.trim();
  const link = store.links.find((l) => l.uuid === uuid);
  // No change — just cancel
  if ((link && (link.customName || '') === newName) || (!link && !newName)) {
    cancelEdit();
    return;
  }

  savingUuid.value = uuid;
  try {
    await store.updateLink(uuid, { customName: newName || '' });
  } finally {
    savingUuid.value = null;
  }
  cancelEdit();
}

async function copyShareUrl(uuid: string, publishType: string, customName?: string) {
  const origin = window.location.origin;
  const identifier = customName || uuid;
  const url = publishType === 'chapter'
    ? `${origin}/s/chapter/${identifier}`
    : `${origin}/s/${identifier}`;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Silently fail
  }
}

onMounted(() => {
  loadLinks();
});
</script>
