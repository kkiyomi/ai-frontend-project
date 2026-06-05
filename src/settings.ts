import { useSettingsStore } from '@/modules/core';
import { billingSettings } from '@/modules/billing';
import { profileSettings } from '@/modules/profile';
import { appearanceSettings } from '@/modules/theme';
import { shareSettings } from '@/modules/share';


export const loadSettings = () => {
  console.log('loadSettings')
  const settingsManager = useSettingsStore();
  settingsManager.registerSection(profileSettings);
  settingsManager.registerSection(billingSettings);
  settingsManager.registerSection(appearanceSettings);
  settingsManager.registerSection(shareSettings);
};
