import { watch, ref } from 'vue';
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router';
import { useSettingsStore } from '@/modules/core';

/**
 * Extract string value from query param (could be string, string[], or null)
 */
function getQueryParamValue(param: LocationQueryValue | LocationQueryValue[]): string | undefined {
  if (param == null) return undefined;
  if (Array.isArray(param)) {
    const first = param[0];
    return first != null ? first : undefined;
  }
  return param;
}

export function useSettingsRouteSync() {
  const route = useRoute();
  const router = useRouter();
  const settingsStore = useSettingsStore();
  const isUpdating = ref(false);

  // Helper to skip sync on Share route (modal not rendered)
  const isShareRoute = () => route.name === 'Share';

  // Route → Store
  watch(() => route.query.settings, (newSectionIdRaw) => {
    if (isUpdating.value || isShareRoute()) return;
    isUpdating.value = true;
    try {
      const newSectionId = getQueryParamValue(newSectionIdRaw);
      if (typeof newSectionId === 'string' && newSectionId.trim()) {
        // Validate section exists
        const section = settingsStore.getSection(newSectionId);
        if (section) {
          settingsStore.openSettings(newSectionId);
        } else {
          console.warn(`Settings section "${newSectionId}" not registered`);
          // Fallback to first section if available, otherwise close modal
          if (settingsStore.allSections.length > 0) {
            const firstSectionId = settingsStore.allSections[0]?.id;
            if (firstSectionId) {
              settingsStore.openSettings(firstSectionId);
            } else {
              settingsStore.closeSettings();
            }
          } else {
            settingsStore.closeSettings();
          }
        }
      } else {
        // No settings param → close modal
        settingsStore.closeSettings();
      }
    } finally {
      isUpdating.value = false;
    }
  }, { immediate: true });

  // Store → Route
  watch([() => settingsStore.showSettings, () => settingsStore.activeSectionId], ([show, activeId]) => {
    if (isUpdating.value || isShareRoute()) return;
    isUpdating.value = true;
    try {
      const currentParam = getQueryParamValue(route.query.settings);
      
      // Handle edge case: modal open but no active section (no sections registered)
      if (show && !activeId) {
        // No section to show → close modal
        settingsStore.closeSettings();
        return;
      }
      
      if (show && activeId) {
        // Modal open with a section → ensure query param matches
        if (currentParam !== activeId) {
          // Decide push vs replace: if no param currently, push to add history entry
          // (UI‑initiated open). If param already exists but mismatched, replace.
          const updateMethod = currentParam === undefined ? router.push : router.replace;
          updateMethod({ query: { ...route.query, settings: activeId } });
        }
      } else {
        // Modal closed → remove settings param if present
        if (currentParam !== undefined) {
          const { settings, ...restQuery } = route.query;
          router.replace({ query: restQuery });
        }
      }
    } finally {
      isUpdating.value = false;
    }
  });
}