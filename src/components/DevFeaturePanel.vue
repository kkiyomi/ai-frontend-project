<template>
  <div v-if="isDevelopment" class="fixed bottom-4 right-4 z-50">
    <!-- Toggle Button -->
    <button
      @click="showPanel = !showPanel"
      class="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
      title="Feature Flags"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Panel -->
    <div
      v-if="showPanel"
      class="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4"
    >
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-semibold text-gray-900">Feature Flags</h3>
        <button @click="showPanel = false" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-3 max-h-96 overflow-y-auto">
        <div
          v-for="flag in Object.values(flags)"
          :key="flag.id"
          class="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
        >
          <div>
            <div class="font-medium text-sm text-gray-900">{{ flag.name }}</div>
            <div class="text-xs text-gray-500">{{ flag.description }}</div>
            <div class="text-xs text-gray-400 mt-1">
              <span class="px-1.5 py-0.5 bg-gray-100 rounded">{{ flag.category }}</span>
            </div>
          </div>
          <button
            @click="toggle(flag.id)"
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              flag.enabled ? 'bg-green-500' : 'bg-gray-300'
            ]"
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                flag.enabled ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-gray-200">
        <button
          @click="resetToDefaults"
          class="text-sm text-gray-600 hover:text-gray-900"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFeaturesStore } from '@/modules/features';

const isDevelopment = import.meta.env.DEV;
const features = useFeaturesStore();
const showPanel = ref(false);

const flags = computed(() => features.flags);

const toggle = (flagId: string) => {
  features.toggle(flagId);
};

const resetToDefaults = () => {
  Object.values(features.flags).forEach(flag => {
    // Reset based on environment variable
    const envValue = import.meta.env[`VITE_FEATURE_${flag.id.toUpperCase()}`];
    if (envValue !== undefined) {
      if (envValue === 'true') {
        features.enable(flag.id);
      } else {
        features.disable(flag.id);
      }
    }
  });
};
</script>
