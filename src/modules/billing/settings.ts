import { type SettingsSection } from '@/modules/core';

export const billingSettings: SettingsSection = {
  id: 'billing',
  title: 'Billing & Plans',
  description: 'Manage your subscription',
  icon: `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M3 7h18M3 10h18M7 15h2m4 0h2m-9 4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  `,
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
