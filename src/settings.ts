import { useProfileStore } from '@/modules/profile';
import { billingSettings } from '@/modules/billing';


export const loadSettings = () => {
  console.log('loadSettings')
  const profile = useProfileStore();
  profile.registerSettingsSection(billingSettings);
};
