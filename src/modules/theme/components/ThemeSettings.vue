<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h3 class="text-lg font-medium text-base-content">Theme Selection</h3>
      <p class="text-sm text-base-content/70">Choose a theme to customize the look and feel of the application.</p>
    </div>

    <!-- Current Theme Display -->
    <div class="p-4 rounded-lg bg-base-200 border border-base-300">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-medium text-base-content">Current Theme:</span>
          <span class="ml-2 px-2 py-1 rounded-md bg-base-300 text-base-content font-medium">
            {{ getThemeDisplayName(currentTheme) }}
          </span>
        </div>
        <button
          @click="resetTheme"
          class="btn btn-sm btn-ghost"
          :disabled="currentTheme === defaultTheme"
        >
          Reset to Default
        </button>
      </div>
    </div>

    <!-- Theme Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div
        v-for="theme in availableThemes"
        :key="theme"
        @click="setTheme(theme)"
        class="relative cursor-pointer group"
      >
        <!-- Theme Card -->
        <div
          class="rounded-lg border-2 transition-all duration-200 overflow-hidden"
          :class="[
            isThemeSelected(theme) 
              ? 'border-primary ring-2 ring-primary/20' 
              : 'border-base-300 hover:border-base-content/30',
            'theme-card'
          ]"
        >
          <!-- Theme Preview Area -->
          <div
            :data-theme="theme"
            class="p-4 h-32 flex flex-col justify-between"
            :class="getThemePreviewClasses(theme)"
          >
            <!-- Preview Content -->
            <div class="flex items-start justify-between">
              <div class="space-y-2">
                <div class="w-8 h-2 rounded bg-primary"></div>
                <div class="w-12 h-2 rounded bg-secondary"></div>
              </div>
              <div class="space-y-2">
                <div class="w-4 h-4 rounded-full bg-accent"></div>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="w-full h-2 rounded bg-base-300"></div>
              <div class="w-3/4 h-2 rounded bg-base-300"></div>
            </div>
          </div>

          <!-- Theme Name -->
          <div class="p-3 bg-base-100 border-t border-base-200">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-base-content truncate">
                {{ getThemeDisplayName(theme) }}
              </span>
              <svg
                v-if="isThemeSelected(theme)"
                class="w-5 h-5 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Selection Indicator (hover) -->
        <div
          v-if="!isThemeSelected(theme)"
          class="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        ></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p class="mt-2 text-sm text-base-content/70">Applying theme...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="p-4 rounded-lg bg-error/10 border border-error/30">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-error mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm text-error">{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme';

const {
  defaultTheme,
  currentTheme,
  availableThemes,
  isLoading,
  error,
  setTheme,
  resetTheme,
  isThemeSelected,
  getThemeDisplayName,
  getThemePreviewClasses,
} = useTheme();
</script>

<style scoped>
.theme-card {
  transition-property: border-color, box-shadow, transform;
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>