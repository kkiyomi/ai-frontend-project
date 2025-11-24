<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="handleBackdropClick">
    <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex" @click.stop>
      <!-- Sidebar -->
      <div class="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Settings</h2>
          <p class="text-sm text-gray-500 mt-1">Manage your preferences</p>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1">
          <!-- Dynamic sections -->
          <button
            v-for="section in settingsSections"
            :key="section.id"
            @click="activeSection = section.id"
            class="w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-left"
            :class="activeSection === section.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            <span v-if="section.icon" class="mr-3" v-html="section.icon"></span>
            <svg v-else class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            {{ section.title }}
          </button>
        </nav>
      </div>

      <!-- Main panel -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ currentSection.title }}</h3>
            <p v-if="currentSection.description" class="text-sm text-gray-500 mt-1">{{ currentSection.description }}</p>
          </div>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Dynamic section -->
          <component
            v-if="currentSection?.component"
            :is="currentSection.component"
            :section="currentSection"
          />

          <!-- Default renderer -->
          <div v-else-if="currentSection" class="space-y-6">
            <div
              v-for="item in currentSection.items"
              :key="item.id"
              class="space-y-2"
            >
              <label class="block text-sm font-medium text-gray-700">{{ item.label }}</label>
              <p v-if="item.description" class="text-xs text-gray-500">{{ item.description }}</p>

              <div v-if="item.type === 'toggle'" class="flex items-center">
                <input type="checkbox" v-model="item.value" class="text-blue-600 focus:ring-blue-500" />
                <span class="ml-2 text-sm text-gray-700">{{ item.label }}</span>
              </div>

              <select
                v-else-if="item.type === 'select'"
                v-model="item.value"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option
                  v-for="option in item.options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>

              <input
                v-else-if="item.type === 'input'"
                v-model="item.value"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <component
                v-else-if="item.type === 'custom' && item.component"
                :is="item.component"
                :item="item"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <div class="text-4xl mb-4">⚙️</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Settings Available</h3>
            <p class="text-gray-500">This section is not yet configured.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { settingsManager } from '../services/settingsManager';

defineEmits({ close: [] });

const activeSection = ref('profile');
const settingsSections = settingsManager.getSections();

const currentSection = computed(() =>
  settingsSections.value.find(s => s.id === activeSection.value) || null
);

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close');
  }
};
</script>
