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
          <!-- Profile Section (built-in) -->
          <button
            @click="activeSection = 'profile'"
            class="w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-left"
            :class="activeSection === 'profile' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>

          <!-- Dynamic Sections (registered by other modules) -->
          <button
            v-for="section in settingsSections"
            :key="section.id"
            @click="activeSection = section.id"
            class="w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors text-left"
            :class="activeSection === section.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
          >
            <span v-if="section.icon" class="mr-3" v-html="section.icon"></span>
            <svg v-else class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            {{ section.title }}
          </button>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ currentSectionTitle }}</h3>
            <p v-if="currentSectionDescription" class="text-sm text-gray-500 mt-1">{{ currentSectionDescription }}</p>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Profile Section (built-in) -->
          <div v-if="activeSection === 'profile'" class="space-y-6">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-medium">
                <img
                  v-if="user?.avatar"
                  :src="user.avatar"
                  :alt="user.name"
                  class="w-16 h-16 rounded-full object-cover"
                />
                <span v-else>{{ userInitials }}</span>
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
                  v-model="profileForm.name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                @click="saveProfile"
                :disabled="isSaving"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>

          <!-- Dynamic Sections -->
          <div v-else-if="currentSection">
            <!-- Custom Component Section -->
            <component
              v-if="currentSection.component"
              :is="currentSection.component"
              :section="currentSection"
            />
            
            <!-- Default Settings Items Renderer -->
            <div v-else class="space-y-6">
              <div
                v-for="item in currentSection.items"
                :key="item.id"
                class="space-y-2"
              >
                <label class="block text-sm font-medium text-gray-700">{{ item.label }}</label>
                <p v-if="item.description" class="text-xs text-gray-500">{{ item.description }}</p>
                
                <!-- Toggle -->
                <div v-if="item.type === 'toggle'" class="flex items-center">
                  <input
                    v-model="item.value"
                    type="checkbox"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ item.label }}</span>
                </div>
                
                <!-- Select -->
                <select
                  v-else-if="item.type === 'select'"
                  v-model="item.value"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option
                    v-for="option in item.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                
                <!-- Input -->
                <input
                  v-else-if="item.type === 'input'"
                  v-model="item.value"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <!-- Custom Component -->
                <component
                  v-else-if="item.type === 'custom' && item.component"
                  :is="item.component"
                  :item="item"
                />
              </div>
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
import { ref, computed, onMounted } from 'vue';
import { useProfileStore } from '../store';
import type { SettingsSection } from '../types';

const emit = defineEmits<{
  close: [];
}>();

const profileStore = useProfileStore();

const activeSection = ref('profile');
const isSaving = ref(false);

const profileForm = ref({
  name: '',
  email: '',
});

const user = computed(() => profileStore.user);
const settingsSections = computed(() => profileStore.settingsSections);

const userInitials = computed(() => profileStore.userInitials);

const currentSection = computed((): SettingsSection | null => {
  return settingsSections.value.find(s => s.id === activeSection.value) || null;
});

const currentSectionTitle = computed(() => {
  if (activeSection.value === 'profile') return 'Profile';
  return currentSection.value?.title || 'Settings';
});

const currentSectionDescription = computed(() => {
  if (activeSection.value === 'profile') return 'Manage your account information';
  return currentSection.value?.description || '';
});

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close');
  }
};

const saveProfile = async () => {
  isSaving.value = true;
  try {
    await profileStore.saveProfile({
      name: profileForm.value.name,
      email: profileForm.value.email,
    });
  } catch (error) {
    console.error('Failed to save profile:', error);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  // Initialize form with current user data
  if (user.value) {
    profileForm.value.name = user.value.name;
    profileForm.value.email = user.value.email;
  }
});
</script>