import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FeatureFlag, FeatureCategory } from './types';
import { defaultFeatureFlags } from './config';

export const useFeaturesStore = defineStore('features', () => {
  const flags = ref<Record<string, FeatureFlag>>({});

  // Initialize with defaults
  const initialize = () => {
    Object.values(defaultFeatureFlags).forEach(flag => {
      if (!(flag.id in flags.value)) {
        flags.value[flag.id] = { ...flag };
      }
    });
    loadFromStorage();
  };

  // Register a new flag (can be called from plugins)
  const registerFlag = (flag: FeatureFlag) => {
    if (!flags.value[flag.id]) {
      flags.value[flag.id] = { ...flag };
    }
    // Override enabled from storage?
    // We could optionally load from storage for this flag, but skip for simplicity
  };

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
    }, {} as Record<FeatureCategory, FeatureFlag[]>)
  );

  // Initialize on store creation
  initialize();

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
    registerFlag,
    
    saveToStorage,
    loadFromStorage,
  };
});
