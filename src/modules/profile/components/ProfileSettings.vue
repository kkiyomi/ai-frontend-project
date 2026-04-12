<template>
  <div class="space-y-6">
    <div class="flex items-center space-x-4">
      <div class="avatar avatar-placeholder flex items-center justify-center">
        <div class="w-16 h-16 rounded-full bg-neutral text-neutral-content">
          <img
            v-if="user?.avatar"
            :src="user.avatar"
            :alt="user.name"
            class="w-16 h-16 rounded-full object-cover"
          />
          <span class="text-xl" v-else>{{ initials }}</span>
        </div>
      </div>
      <div>
        <h4 class="text-lg font-medium text-base-content">{{ user?.name || 'User' }}</h4>
        <p class="text-sm text-base-content/60">{{ user?.email || '' }}</p>
      </div>
    </div>

    <div class="flex justify-end">
      <a href="https://absolutemystery.com/my" target="_self" aria-label="Login"
        class="px-4 py-2 btn btn-primary disabled:opacity-50">
          <span>Manage account</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProfileStore } from '../store';

const profileStore = useProfileStore();

const user = computed(() => profileStore.user);
const initials = computed(() => profileStore.userInitials);
</script>
