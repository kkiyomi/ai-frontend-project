/**
 * Centralized feature flag management
 * Controls which features are enabled/disabled across the application
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'ui' | 'export' | 'sharing' | 'integration' | 'experimental' | 'billing';
  requiresAuth?: boolean;
  defaultEnv?: 'development' | 'staging' | 'production';
}

export const useFeaturesStore = defineStore('features', () => {
  // Default feature flags (can be overridden by environment or API)
  const flags = ref<Record<string, FeatureFlag>>({
    // UI Features
    export_button: {
      id: 'export_button',
      name: 'Export Button',
      description: 'Show export functionality in the UI',
      enabled: import.meta.env.VITE_FEATURE_EXPORT !== 'false',
      category: 'export',
      defaultEnv: 'development'
    },
    sharing_button: {
      id: 'sharing_button',
      name: 'Sharing Button',
      description: 'Enable content sharing features',
      enabled: import.meta.env.VITE_FEATURE_SHARING !== 'false',
      category: 'sharing',
      requiresAuth: true,
      defaultEnv: 'development'
    },
    
    // Experimental Features
    ai_suggestions: {
      id: 'ai_suggestions',
      name: 'AI Suggestions',
      description: 'Enable AI-powered translation suggestions',
      enabled: import.meta.env.VITE_FEATURE_AI_SUGGESTIONS === 'true',
      category: 'experimental',
      defaultEnv: 'development'
    },
    
    // Integration Features
    google_drive: {
      id: 'google_drive',
      name: 'Google Drive Integration',
      description: 'Import/export from Google Drive',
      enabled: import.meta.env.VITE_FEATURE_GOOGLE_DRIVE === 'true',
      category: 'integration',
      requiresAuth: true,
      defaultEnv: 'staging'
    },
    
    // Billing Features
    advanced_billing: {
      id: 'advanced_billing',
      name: 'Advanced Billing',
      description: 'Show advanced billing options and analytics',
      enabled: import.meta.env.VITE_FEATURE_ADVANCED_BILLING !== 'false',
      category: 'billing',
      defaultEnv: 'production'
    }
  });

  // Computed
  const enabledFlags = computed(() => 
    Object.values(flags.value).filter(f => f.enabled)
  );
  
  const disabledFlags = computed(() => 
    Object.values(flags.value).filter(f => !f.enabled)
  );
  
  const flagsByCategory = computed(() => 
    Object.values(flags.value).reduce((acc, flag) => {
      if (!acc[flag.category]) acc[flag.category] = [];
      acc[flag.category].push(flag);
      return acc;
    }, {} as Record<string, FeatureFlag[]>)
  );

  // Actions
  const enable = (flagId: string) => {
    if (flags.value[flagId]) {
      flags.value[flagId].enabled = true;
      saveToStorage();
    }
  };

  const disable = (flagId: string) => {
    if (flags.value[flagId]) {
      flags.value[flagId].enabled = false;
      saveToStorage();
    }
  };

  const toggle = (flagId: string) => {
    if (flags.value[flagId]) {
      flags.value[flagId].enabled = !flags.value[flagId].enabled;
      saveToStorage();
    }
  };

  const isEnabled = (flagId: string): boolean => {
    return flags.value[flagId]?.enabled ?? false;
  };

  // Check multiple flags
  const allEnabled = (flagIds: string[]): boolean => 
    flagIds.every(id => isEnabled(id));

  const anyEnabled = (flagIds: string[]): boolean => 
    flagIds.some(id => isEnabled(id));

  // Persistence
  const saveToStorage = () => {
    try {
      const toSave = Object.entries(flags.value).reduce((acc, [key, flag]) => ({
        ...acc,
        [key]: flag.enabled
      }), {});
      localStorage.setItem('feature-flags', JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save feature flags:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('feature-flags');
      if (stored) {
        const savedFlags = JSON.parse(stored);
        Object.keys(savedFlags).forEach(key => {
          if (flags.value[key]) {
            flags.value[key].enabled = savedFlags[key];
          }
        });
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    }
  };

  // Initialize
  loadFromStorage();

  return {
    flags,
    enabledFlags,
    disabledFlags,
    flagsByCategory,
    
    isEnabled,
    allEnabled,
    anyEnabled,
    
    enable,
    disable,
    toggle,
    
    saveToStorage,
    loadFromStorage,
  };
});

// Convenience composable
export const useFeatures = () => {
  const store = useFeaturesStore();
  return {
    isEnabled: store.isEnabled,
    allEnabled: store.allEnabled,
    anyEnabled: store.anyEnabled,
    flags: store.flags,
    enabledFlags: store.enabledFlags,
  };
};
