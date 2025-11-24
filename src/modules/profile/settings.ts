// profile.settings.ts
import type { SettingsSection } from '@/modules/core';
import ProfileSettingsSection from './components/ProfileSettings.vue';

export const profileSettings: SettingsSection = {
  id: 'profile',
  title: 'Profile',
  description: 'Manage your account information',
  icon: `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  `,
  component: ProfileSettingsSection,
  items: [], // Not used because this section is fully custom
};
