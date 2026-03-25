/**
 * Profile Module - Pinia Store
 *
 * Manages user profile state and settings with full API integration.
 * Automatically loads user profile on store initialization using the profile API.
 * Provides computed properties for authentication state, user initials,
 * and comprehensive error handling for profile operations.
 *
 * Usage Example:
 * ```typescript
 * import { useProfileStore } from '@/modules/profile';
 *
 * const profile = useProfileStore();
 *
 * // Check authentication state
 * if (profile.isLoggedIn) {
 *   console.log(profile.user?.name);
 * }
 *
 * // Update profile with API persistence
 * await profile.saveProfile({ name: 'New Name' });
 *
 * // Logout
 * await profile.logout();
 * ```
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { profileAPI } from './api';
import type { User, ProfileState } from './types';

export const useProfileStore = defineStore('profile', () => {
  // State
  const user = ref<User | null>(null);
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);

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


  // Placeholder methods for future API integration
  async function loadProfile(): Promise<void> {
    setLoading(true);
    setError(null);
    
    try {
      const response = await profileAPI.getProfile();
      
      if (response.success && response.data) {
        user.value = response.data;
      } else {
        setError(response.error || 'Failed to load profile');
      }
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
      const response = await profileAPI.updateProfile(updates);
      
      if (response.success && response.data) {
        user.value = response.data;
      } else {
        setError(response.error || 'Failed to save profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  async function logout(): Promise<void> {
    setLoading(true);
    
    try {
      // TODO: Add logout API call when needed
      await new Promise(resolve => setTimeout(resolve, 200));
      clearProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    } finally {
      setLoading(false);
    }
  }

  // Load profile on store initialization
  loadProfile();

  return {
    // State
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
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
  };
});
