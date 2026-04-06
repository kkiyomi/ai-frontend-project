<template>
  <div v-if="settings.isSettingsVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="handleBackdropClick">
     <div class="bg-base-100 rounded-lg w-full max-w-5xl h-[80vh] mx-4 flex overflow-hidden shadow-2xl" @click.stop>
      <!-- Sidebar -->
       <div class="w-64 bg-base-200 border-r border-base-300 flex flex-col">
        <!-- Header -->
         <div class="p-6 border-b border-base-300">
           <h2 class="text-lg font-semibold text-base-content">Settings</h2>
           <p class="text-sm text-base-content/70 mt-1">Manage your preferences</p>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1">
          <!-- Dynamic sections -->
          <button
            v-for="section in settings.allSections"
            :key="section.id"
            @click="settings.setActiveSection(section.id)"
            class="w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-left"
             :class="settings.activeSectionId === section.id ? 'bg-primary/20 text-primary' : 'text-base-content hover:bg-base-300'"
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
         <div class="flex items-center justify-between p-6 border-b border-base-300">
          <div v-if="currentSection">
             <h3 class="text-lg font-semibold text-base-content">{{ currentSection.title }}</h3>
             <p v-if="currentSection.description" class="text-sm text-base-content/70 mt-1">{{ currentSection.description }}</p>
          </div>
           <button @click="settings.closeSettings()" class="btn btn-ghost btn-sm btn-circle">
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
               <label class="block text-sm font-medium text-base-content">{{ item.label }}</label>
               <p v-if="item.description" class="text-xs text-base-content/70">{{ item.description }}</p>

              <div v-if="item.type === 'toggle'" class="flex items-center">
                 <input type="checkbox" v-model="item.value" class="checkbox checkbox-primary" />
                 <span class="ml-2 text-sm text-base-content">{{ item.label }}</span>
              </div>

               <select
                 v-else-if="item.type === 'select'"
                 v-model="item.value"
                 class="select select-bordered w-full"
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
                 class="input input-bordered w-full"
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
             <h3 class="text-lg font-medium text-base-content mb-2">No Settings Available</h3>
             <p class="text-base-content/70">This section is not yet configured.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '../store';
import type { SettingsItem, SettingsSection } from '../types';

const settings = useSettingsStore();

const currentSection = computed(() => {
  const id = settings.activeSectionId;
  const all = settings.allSections;
  if (id) {
    const found = all.find((s: SettingsSection) => s.id === id);
    if (found) return found;
  }
  // fallback to first section if any
  return all[0] || null;
});

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    settings.closeSettings();
  }
};
</script>
