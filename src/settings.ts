import { useSettingsStore } from '@/modules/core';
import { billingSettings } from '@/modules/billing';
import { profileSettings } from '@/modules/profile';


export const loadSettings = () => {
  console.log('loadSettings')
  const settingsManager = useSettingsStore();
  settingsManager.registerSection(profileSettings);
  settingsManager.registerSection(billingSettings);
};
