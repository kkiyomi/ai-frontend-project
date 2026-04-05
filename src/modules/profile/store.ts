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
import { ref, computed, watch } from 'vue';
import { profileAPI } from './api';
import { getSharedSession } from '@/modules/core';
import type { User, ProfileState } from './types';

// External logout URL (Odoo backend)
const LOGOUT_URL = 'https://absolutemystery.com/web/session/logout';

export const useProfileStore = defineStore('profile', () => {
  // State
  const user = ref<User | null>(null);
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Session synchronization
  const session = getSharedSession();

  // Watch session state changes to keep profile in sync
  watch(() => session.isLoggedIn.value, (isLoggedIn) => {
    if (!isLoggedIn) {
      // Session became invalid - clear profile data
      clearProfile();
    } else {
      // Session became valid - load profile if not already loaded
      if (!user.value) {
        loadProfile();
      }
    }
  }, { immediate: true });

  // Computed
  const profileState = computed<ProfileState>(() => ({
    user: user.value,
    isLoading: isLoading.value,
    error: error.value,
  }));

  const isLoggedIn = computed(() => session.isLoggedIn.value);

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
      // Clear local state first
      clearProfile();
      
      // Invalidate session cache to ensure fresh check on return
      session.invalidateCache();
      
      // Redirect to external logout URL (Odoo backend)
      // This will log the user out on the backend and redirect to login page
      window.location.href = LOGOUT_URL;
      
      // Note: Code after redirect may not execute due to page navigation
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
    user,
    isLoading,
    error,
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
