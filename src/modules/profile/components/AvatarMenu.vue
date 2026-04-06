<template>
  <div class="relative dropdown dropdown-end">
    <!-- Avatar Button -->
    <button
      @click="toggleMenu"
      class="btn btn-ghost flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      :class="{ 'bg-gray-100': isMenuOpen }"
    >
      <!-- Avatar -->
       <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
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
        <div class="text-sm font-medium text-gray-900">{{ user?.name || 'User' }}</div>
        <div class="text-xs text-gray-500">{{ user?.email || '' }}</div>
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
            <div class="text-sm font-medium text-gray-900">{{ user?.name || 'User' }}</div>
            <div class="text-xs text-gray-500">{{ user?.email || '' }}</div>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="py-1">
        <button
          @click="handleOpenSettings"
           class="btn btn-ghost w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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