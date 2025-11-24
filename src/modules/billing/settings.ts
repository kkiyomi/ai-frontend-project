import { type SettingsSection } from '@/modules/profile';

export const billingSettings: SettingsSection = {
  id: 'billing',
  title: 'Billing & Plans',
  description: 'Manage your subscription',
  items: [
    {
      id: 'plan',
      type: 'select',
      label: 'Current Plan',
      value: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' }
      ]
    }
  ]
};
