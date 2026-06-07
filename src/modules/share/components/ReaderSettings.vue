<template>
  <div class="modal modal-open" @click.self="$emit('close')">
    <div class="modal-box max-w-sm">
      <h3 class="text-lg font-bold mb-4">Reader Settings</h3>

      <!-- Tabs -->
      <div class="tabs tabs-box mb-4">
        <button
          class="tab"
          :class="{ 'tab-active': activeTab === 'visual' }"
          @click="activeTab = 'visual'"
        >
          Visual
        </button>
        <button
          class="tab"
          :class="{ 'tab-active': activeTab === 'cache' }"
          @click="activeTab = 'cache'"
        >
          Cache
        </button>
      </div>

      <!-- Visual tab -->
      <div v-if="activeTab === 'visual'" class="space-y-4">
        <!-- Font -->
        <div>
          <label class="text-sm font-medium">Font</label>
          <select v-model="font" class="select select-bordered select-sm w-full mt-1">
            <option value="default">Default (Serif)</option>
            <option value="dyslexic">Dyslexic-friendly</option>
            <option value="roboto">Roboto</option>
            <option value="lora">Lora</option>
          </select>
        </div>

        <!-- Font size -->
        <div>
          <div class="flex justify-between text-sm">
            <label class="font-medium">Font Size</label>
            <span class="text-base-content/50">{{ fontSize }}px</span>
          </div>
          <input
            type="range"
            v-model.number="fontSize"
            min="14"
            max="28"
            step="1"
            class="range range-xs range-primary mt-1"
          />
        </div>

        <!-- Line spacing -->
        <div>
          <div class="flex justify-between text-sm">
            <label class="font-medium">Line Spacing</label>
            <span class="text-base-content/50">{{ lineSpacing }}</span>
          </div>
          <input
            type="range"
            v-model.number="lineSpacing"
            min="1.2"
            max="3"
            step="0.1"
            class="range range-xs range-primary mt-1"
          />
        </div>

        <!-- Paragraph spacing -->
        <div>
          <div class="flex justify-between text-sm">
            <label class="font-medium">Paragraph Spacing</label>
            <span class="text-base-content/50">{{ paragraphSpacing }}em</span>
          </div>
          <input
            type="range"
            v-model.number="paragraphSpacing"
            min="0.5"
            max="4"
            step="0.1"
            class="range range-xs range-primary mt-1"
          />
        </div>

        <!-- Page width -->
        <div>
          <div class="flex justify-between text-sm">
            <label class="font-medium">Page Width</label>
            <span class="text-base-content/50">{{ pageWidth }}px</span>
          </div>
          <input
            type="range"
            v-model.number="pageWidth"
            min="500"
            max="2000"
            step="50"
            class="range range-xs range-primary mt-1"
          />
        </div>

        <!-- Auto-scroll -->
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">Auto Scroll</label>
          <input type="checkbox" v-model="autoScroll" class="toggle toggle-sm toggle-primary" />
        </div>

        <!-- Reset to Defaults -->
        <div class="pt-2">
          <button @click="doReset" class="btn btn-sm btn-outline w-full">
            Reset to Defaults
          </button>
        </div>
      </div>

      <!-- Cache tab -->
      <div v-else class="space-y-4">
        <!-- Offline reading -->
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">Offline Reading</label>
          <input type="checkbox" v-model="offlineEnabled" class="toggle toggle-sm toggle-primary" />
        </div>

        <!-- Chapters ahead -->
        <div>
          <div class="flex justify-between text-sm">
            <label class="font-medium">Chapters Ahead</label>
            <span class="text-base-content/50">{{ chaptersAhead }}</span>
          </div>
          <input
            type="range"
            v-model.number="chaptersAhead"
            min="1"
            max="20"
            step="1"
            class="range range-xs range-primary mt-1"
          />
        </div>

        <!-- Cache status -->
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium">Cached Chapters</span>
          <span class="badge badge-sm">{{ cachedCount }}</span>
        </div>

        <!-- Clear cache -->
        <button @click="doClearCache" class="btn btn-sm btn-outline btn-error w-full">
          Clear Cache
        </button>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import {
  font,
  fontSize,
  lineSpacing,
  paragraphSpacing,
  pageWidth,
  autoScroll,
  offlineEnabled,
  chaptersAhead,
  getCachedCount,
  clearCache,
  resetToDefaults,
} from '../composables/useReaderSettings';

defineEmits<{ close: [] }>();

const activeTab = ref<'visual' | 'cache'>('visual');
const cachedCount = ref(0);
watchEffect(() => { cachedCount.value = getCachedCount(); });

function doClearCache() {
  clearCache();
  cachedCount.value = getCachedCount();
}

function doReset() {
  resetToDefaults();
}
</script>
