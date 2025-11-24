/**
 * Core Module - Settings Manager
 *
 * Centralized settings management service that allows modules to register
 * their settings sections without creating circular dependencies.
 */

import { ref, computed, markRaw } from 'vue';
import type { SettingsSection, SettingsItem } from '../types/settings';

class SettingsManager {
  private sections = ref<SettingsSection[]>([]);

  /**
   * Get all registered settings sections
   */
  getSections() {
    return computed(() => this.sections.value);
  }

  /**
   * Register a settings section
   */
  registerSection(section: SettingsSection) {
    // Clone the incoming section so we never mutate the caller's object
    const safeSection: SettingsSection = {
      ...section,
      component: section.component ? markRaw(section.component) : undefined,
      items: section.items?.map((item: SettingsItem) => ({
        ...item,
        component: item.component ? markRaw(item.component) : undefined,
      })) || [],
    };

    const index = this.sections.value.findIndex(s => s.id === safeSection.id);

    if (index !== -1) {
      this.sections.value[index] = safeSection;
    } else {
      this.sections.value.push(safeSection);
    }
  }

  /**
   * Unregister a settings section
   */
  unregisterSection(sectionId: string) {
    this.sections.value = this.sections.value.filter(s => s.id !== sectionId);
  }

  /**
   * Get a specific settings section
   */
  getSection(sectionId: string): SettingsSection | undefined {
    return this.sections.value.find(s => s.id === sectionId);
  }

  /**
   * Clear all sections (useful for testing)
   */
  clearSections() {
    this.sections.value = [];
  }
}

// Export singleton instance
export const settingsManager = new SettingsManager();