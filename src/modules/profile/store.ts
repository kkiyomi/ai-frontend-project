/**
 * Profile Module - Pinia Store
 *
 * Manages user profile state and settings.
 * Provides placeholder data without API connections for now.
 *
 * Usage Example:
 * ```typescript
 * import { useProfileStore } from '@/modules/profile';
 *
 * const profile = useProfileStore();
 * 
 * // Access user data
 * console.log(profile.user?.name);
 * 
 * // Update profile
 * profile.updateProfile({ name: 'New Name' });
 * ```
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, ProfileState, SettingsSection } from './types';

export const useProfileStore = defineStore('profile', () => {
  // State
  const user = ref<User | null>({
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: undefined,
    createdAt: new Date('2024-01-15'),
  });
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const settingsSections = ref<SettingsSection[]>([]);

  // Computed
  const profileState = computed<ProfileState>(() => ({
    user: user.value,
    isLoading: isLoading.value,
    error: error.value,
  }));

  const isLoggedIn = computed(() => !!user.value);

  const userInitials = computed(() => {
    if (!user.value?.name) return '';
    return user.value.name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  });

  // Actions
  function updateProfile(updates: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updates };
    }
  }

  function clearProfile() {
    user.value = null;
    error.value = null;
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage;
  }

  // Settings management (for other modules to register settings)
  function registerSettingsSection(section: SettingsSection) {
    const existingIndex = settingsSections.value.findIndex(s => s.id === section.id);
    if (existingIndex !== -1) {
      settingsSections.value[existingIndex] = section;
    } else {
      settingsSections.value.push(section);
    }
  }

  function unregisterSettingsSection(sectionId: string) {
    settingsSections.value = settingsSections.value.filter(s => s.id !== sectionId);
  }

  function getSettingsSection(sectionId: string): SettingsSection | undefined {
    return settingsSections.value.find(s => s.id === sectionId);
  }

  // Placeholder methods for future API integration
  async function loadProfile(): Promise<void> {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Profile is already set with placeholder data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(updates: Partial<User>): Promise<void> {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300));
      updateProfile(updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  async function logout(): Promise<void> {
    setLoading(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 200));
      clearProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    } finally {
      setLoading(false);
    }
  }

  return {
    // State
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    settingsSections: computed(() => settingsSections.value),
    profileState,

    // Computed
    isLoggedIn,
    userInitials,

    // Actions
    updateProfile,
    clearProfile,
    setLoading,
    setError,
    loadProfile,
    saveProfile,
    logout,

    // Settings management
    registerSettingsSection,
    unregisterSettingsSection,
    getSettingsSection,
  };
});