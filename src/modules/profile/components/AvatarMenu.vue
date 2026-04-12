<template>
  <div class="relative dropdown dropdown-end">
    <!-- Avatar Button -->
    <button
      @click="toggleMenu"
      class="btn btn-ghost flex items-center space-x-2 p-2 rounded-lg hover:bg-base-300 transition-colors"
      :class="{ 'bg-base-300': isMenuOpen }"
    >
      <!-- Avatar -->
       <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium">
        <img
          v-if="user?.avatar"
          :src="user.avatar"
          :alt="user.name"
          class="w-8 h-8 rounded-full object-cover"
        />
        <span v-else>{{ userInitials }}</span>
      </div>
      
      <!-- User Info (optional, shown when expanded) -->
      <div v-if="showUserInfo" class="hidden sm:block text-left">
        <div class="text-sm font-medium text-base-content">{{ user?.name || 'User' }}</div>
        <div class="text-xs text-base-content/60">{{ user?.email || '' }}</div>
      </div>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isMenuOpen"
      class="absolute right-0 mt-2 w-56 dropdown-content menu bg-base-100 shadow-lg border border-base-300 py-1 z-50"
      @click.stop
    >
      <!-- User Info Header -->
       <div class="px-4 py-3 border-b border-base-300">
        <div class="flex items-center space-x-3">
          <div>
            <div class="text-sm font-medium text-base-content">{{ user?.name || 'User' }}</div>
            <div class="text-xs text-base-content/60">{{ user?.email || '' }}</div>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="py-1.5">
        <button
          @click="handleOpenSettings"
          class="group w-full flex items-center gap-3 px-3 py-2 mx-1 rounded-lg text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-content/6 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          style="width: calc(100% - 0.5rem)"
        >
          <span class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-base-content/5 group-hover:bg-base-content/10 transition-colors duration-150">
            <svg class="w-3.5 h-3.5 text-base-content/50 group-hover:text-base-content/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          Settings
        </button>

        <div class="my-1.5 mx-3 border-t border-base-content/8"></div>

        <button
          @click="handleLogout"
          class="group w-full flex items-center gap-3 px-3 py-2 mx-1 rounded-lg text-sm font-medium text-error/70 hover:text-error hover:bg-error/8 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
          style="width: calc(100% - 0.5rem)"
        >
          <span class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-error/8 group-hover:bg-error/15 transition-colors duration-150">
            <svg class="w-3.5 h-3.5 text-error/60 group-hover:text-error/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { User } from '../types';
import { useProfileStore } from '../store';
import { useSettingsStore } from '@/modules/core';

const settings = useSettingsStore();
const profile = useProfileStore();

interface Props {
  showUserInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showUserInfo: false,
});

const emit = defineEmits<{
  'logout': [];
}>();

const user = computed(() => profile.user);
const isMenuOpen = ref(false);

const userInitials = computed(() => {
  if (!user.value?.name) return 'U';
  return user.value.name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleOpenSettings = () => {
  settings.openSettings();
  closeMenu();
};

const handleLogout = () => {
  emit('logout');
  closeMenu();
};

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>