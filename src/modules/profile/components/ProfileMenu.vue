<template>
  <div class="w-full px-2 pb-2">
    <div class="w-full relative dropdown dropdown-top">

      <!-- Avatar Button -->
      <button
        @click="toggleMenu"
        class="btn btn-ghost flex items-center justify-start space-x-3 p-2 w-full rounded-lg hover:bg-base-300 transition-colors"
        :class="{ 'bg-base-300': isMenuOpen }"
      >
        <!-- Avatar -->
          <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-medium">
          <img
            v-if="user?.avatar"
            :src="user.avatar"
            :alt="user.name"
            class="w-9 h-9 rounded-full object-cover"
          />
          <span v-else>{{ userInitials }}</span>
        </div>

        <!-- Name -->
        <span class="text-sm font-medium text-base-content truncate">
          {{ user?.name || 'User' }}
        </span>
      </button>

      <!-- Dropdown Menu (opens upward) -->
      <div
        v-if="isMenuOpen"
        class="absolute bottom-full mb-2 w-56 dropdown-content menu bg-base-100 shadow-lg border border-base-300 py-1 z-50
         transition-all duration-150 ease-out"
        :class="{
          'opacity-100 translate-y-0': isMenuOpen,
          'opacity-0 translate-y-2': !isMenuOpen
        }"
        @click.stop
      >
        <!-- User Header -->
         <div class="px-4 py-3 border-b border-base-300">
          <div class="flex items-center space-x-3">
             <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-medium">
              <img
                v-if="user?.avatar"
                :src="user.avatar"
                :alt="user.name"
                class="w-10 h-10 rounded-full object-cover"
              />
              <span v-else>{{ userInitials }}</span>
            </div>
            <div>
              <div class="text-sm font-medium text-base-content">
                {{ user?.name || 'User' }}
              </div>
              <div class="text-xs text-base-content/60">{{ user?.email || '' }}</div>
            </div>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="py-1">

           <button
            @click="handleOpenSettings"
            class="btn btn-ghost w-full flex items-center px-4 py-2 text-sm text-base-content/80 hover:bg-base-300 transition-colors"
          >
            <svg class="w-4 h-4 mr-3 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>

           <div class="border-t border-base-300 my-1"></div>

           <button
            @click="handleLogout"
            class="btn btn-error btn-ghost w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg class="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { User } from '../types'
import { useProfileStore } from '../store';
import { useSettingsStore } from '@/modules/core';

const settings = useSettingsStore();
const profile = useProfileStore();

const emit = defineEmits<{
  'logout': []
}>()

const user = computed(() => profile.user);
const isMenuOpen = ref(false)

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value?.name
    .split(' ')
    .map(p => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('')
})

const toggleMenu = () => (isMenuOpen.value = !isMenuOpen.value)
const closeMenu = () => (isMenuOpen.value = false)

const handleOpenSettings = () => {
  settings.openSettings();
  closeMenu()
}

const handleLogout = () => {
  emit('logout')
  closeMenu()
}

const handleClickOutside = (event: MouseEvent) => {
  const el = event.target as HTMLElement
  if (!el.closest('.relative')) closeMenu()
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>
