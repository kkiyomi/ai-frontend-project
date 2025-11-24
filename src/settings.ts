import { settingsManager } from '@/modules/core';
import { billingSettings } from '@/modules/billing';


export const loadSettings = () => {
  console.log('loadSettings')
  settingsManager.registerSection(billingSettings);
};
