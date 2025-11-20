/**
 * Profile Module - Public API
 *
 * The Profile module manages user profile information and global settings.
 *
 * Features:
 * - Avatar menu component for user actions
 * - Settings modal for global application settings
 * - Profile state management (name, email, avatar)
 * - Extensible settings system for other modules
 *
 * Integration Example:
 * ```typescript
 * // In main app
 * import { AvatarMenu, SettingsModal, useProfileStore } from '@/modules/profile';
 *
 * const profile = useProfileStore();
 *
 * // Use avatar menu
 * <AvatarMenu
 *   :user="profile.user"
 *   @open-settings="showSettings = true"
 *   @logout="handleLogout"
 * />
 *
 * // Use settings modal
 * <SettingsModal
 *   v-if="showSettings"
 *   @close="showSettings = false"
 * />
 * ```
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
export { default as SettingsModal } from './components/SettingsModal.vue';

// Types
export type {
  User,
  ProfileState,
  SettingsSection,
  SettingsItem
} from './types';