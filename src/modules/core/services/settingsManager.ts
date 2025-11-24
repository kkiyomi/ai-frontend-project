/**
 * Core Module - Settings Manager
 *
 * Centralized settings management service that allows modules to register
 * their settings sections without creating circular dependencies.
 */

import { ref, computed } from 'vue';
import type { SettingsSection } from '../types/settings';

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
    const existingIndex = this.sections.value.findIndex(s => s.id === section.id);
    if (existingIndex !== -1) {
      this.sections.value[existingIndex] = section;
    } else {
      this.sections.value.push(section);
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