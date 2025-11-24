<template>
  <div class="space-y-6">
    <div class="flex items-center space-x-4">
      <div class="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-medium">
        <img
          v-if="user?.avatar"
          :src="user.avatar"
          :alt="user.name"
          class="w-16 h-16 rounded-full object-cover"
        />
        <span v-else>{{ initials }}</span>
      </div>
      <div>
        <h4 class="text-lg font-medium text-gray-900">{{ user?.name || 'User' }}</h4>
        <p class="text-sm text-gray-500">{{ user?.email || '' }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          v-model="form.email"
          type="email"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
        />
      </div>
    </div>

    <div class="flex justify-end">
      <button
        @click="save"
        :disabled="isSaving"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProfileStore } from '../store';

const profileStore = useProfileStore();

const user = computed(() => profileStore.user);
const initials = computed(() => profileStore.userInitials);

const form = ref({ name: '', email: '' });
const isSaving = ref(false);

const save = async () => {
  isSaving.value = true;
  try {
    await profileStore.saveProfile({
      name: form.value.name,
      email: form.value.email,
    });
  } catch (err) {
    console.error('Failed to save profile:', err);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  if (user.value) {
    form.value.name = user.value.name;
    form.value.email = user.value.email;
  }
});
</script>
