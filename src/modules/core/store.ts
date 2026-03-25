import { defineStore } from 'pinia';
import { ref, computed, markRaw } from 'vue';
import type { SettingsSection, SettingsItem } from './types';

/**
 * Centralized settings store for the Core module.
 * Manages registered sections and settings modal visibility.
 */
export const useSettingsStore = defineStore('settings', () => {
  // --- State ---
  const sections = ref<SettingsSection[]>([]);
  const showSettings = ref(false); // modal visibility
  const activeSectionId = ref<string | null>(null);

  // --- Getters ---
  const allSections = computed(() => sections.value);
  const getSection = (id: string) =>
    sections.value.find((s: SettingsSection) => s.id === id);
  const isSettingsVisible = computed(() => showSettings.value);

  // --- Actions ---
  function registerSection(section: SettingsSection) {
    const safeSection: SettingsSection = {
      ...section,
      component: section.component ? markRaw(section.component) : undefined,
      items: section.items?.map((item: SettingsItem) => ({
        ...item,
        component: item.component ? markRaw(item.component) : undefined,
      })) || [],
    };

    const index = sections.value.findIndex((s: SettingsSection) => s.id === safeSection.id);
    if (index !== -1) sections.value[index] = safeSection;
    else sections.value.push(safeSection);
  }

  function unregisterSection(sectionId: string) {
    sections.value = sections.value.filter((s: SettingsSection) => s.id !== sectionId);
  }

  function clearSections() {
    sections.value = [];
  }

  // --- Settings Modal Management ---
  function openSettings(sectionId?: string) {
    if (sectionId) {
      activeSectionId.value = sectionId;
    } else if (sections.value.length > 0) {
      // default to first registered section
      activeSectionId.value = sections.value[0].id;
    } else {
      activeSectionId.value = null;
    }
    showSettings.value = true;
  }

  function closeSettings() {
    showSettings.value = false;
    activeSectionId.value = null;
  }

  function toggleSettings() {
    showSettings.value = !showSettings.value;
  }

  function setActiveSection(sectionId: string) {
    activeSectionId.value = sectionId;
  }

  // --- Return state, getters, actions ---
  return {
    // state
    sections,
    showSettings,
    activeSectionId,

    // getters
    allSections,
    getSection,
    isSettingsVisible,

    // actions
    registerSection,
    unregisterSection,
    clearSections,
    openSettings,
    closeSettings,
    toggleSettings,
    setActiveSection,
  };
});
