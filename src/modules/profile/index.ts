/**
 * Profile Module - Public API
 *
 * The Profile module manages user profile information and global settings.
 *
 * Features:
 * - Avatar menu component for user actions
 * - Settings modal for global application settings
 * - Profile state management (name, email, avatar)
 * - Integration with Core's centralized settings system
 *
 * Integration Example:
 * ```typescript
 * // In main app
 * import { AvatarMenu, useProfileStore } from '@/modules/profile';
 * import { settingsManager } from '@/modules/core';
 *
 * const profile = useProfileStore();
 * 
 * // Register settings from other modules
 * settingsManager.registerSection(billingSettings);
 *
 * // Use avatar menu
 * <AvatarMenu
 *   :user="profile.user"
 *   @open-settings="showSettings = true"
 *   @logout="handleLogout"
 * />
 *
 *
 * Module Independence:
 * - Does NOT import from other domain modules (billing, glossary, etc.)
 * - Only depends on Core for infrastructure (types, utilities)
 * - Other modules can register settings sections via the settings system
 */

// Store
export { useProfileStore } from './store';

// Components
export { default as AvatarMenu } from './components/AvatarMenu.vue';

// Types
export type {
  User,
  ProfileState,
} from './types';

export { profileSettings } from './settings';
