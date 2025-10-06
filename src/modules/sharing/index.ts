/**
 * Sharing Module - Public API
 *
 * This module manages all sharing functionality including:
 * - Creating and managing share links
 * - Viewing shared content
 * - Password-protected shares
 * - Share statistics and tracking
 *
 * Usage Examples:
 *
 * 1. Using the Sharing Store in a component:
 *
 * import { useSharingStore } from '@/modules/sharing';
 *
 * const sharingStore = useSharingStore();
 *
 * // Create a share
 * sharingStore.setCreatingShare(true);
 * const result = await sharingAPI.createShare({
 *   chapterIds: ['ch1'],
 *   seriesIds: [],
 *   title: 'My Translation'
 * });
 * if (result.success) {
 *   sharingStore.addRecentShare(result.data);
 * }
 * sharingStore.setCreatingShare(false);
 *
 *
 * 2. Using the Sharing API directly:
 *
 * import { sharingAPI } from '@/modules/sharing';
 *
 * // Create share
 * const createResult = await sharingAPI.createShare({
 *   chapterIds: ['ch1', 'ch2'],
 *   seriesIds: ['s1'],
 *   title: 'Translation Collection',
 *   expirationDays: 30
 * });
 *
 * // Get shared content
 * const getResult = await sharingAPI.getSharedContent('share-123');
 *
 *
 * 3. Using Sharing Components:
 *
 * import { ShareButton, ShareModal, ShareView } from '@/modules/sharing';
 *
 * // In template:
 * <ShareButton />
 *
 *
 * 4. How API switching works:
 *
 * The module automatically uses mock or real API based on environment:
 * - Mock mode: Set VITE_USE_MOCK_API=true in .env
 * - Real mode: Set VITE_USE_MOCK_API=false (default)
 *
 * The api/index.ts file imports isMockMode() from Core and exports
 * the appropriate API instance (mockSharingAPI or realSharingAPI).
 *
 *
 * 5. How Sharing integrates with Core:
 *
 * - Sharing API (api/real.ts) imports apiClient from Core
 * - apiClient provides: HTTP methods, caching, error handling
 * - No direct dependencies on other feature modules
 * - All HTTP requests go through Core's apiClient
 *
 * Example from api/real.ts:
 * import { apiClient } from '@/modules/core/services/apiClient';
 * return apiClient.post('/api/shares', request);
 */

// Store
export { useSharingStore } from './store';

// API
export { sharingAPI, realSharingAPI, mockSharingAPI } from './api';

// Components
export { default as ShareButton } from './components/ShareButton.vue';
export { default as ShareModal } from './components/ShareModal.vue';
export { default as ShareView } from './components/ShareViewWrapper.vue';
export { default as ShareContentSelector } from './components/ShareContentSelector.vue';
export { default as ShareDetailsForm } from './components/ShareDetailsForm.vue';
export { default as SharePreview } from './components/SharePreview.vue';

// Types
export type {
  ShareRequest,
  ShareResponse,
  SharedContent,
  ShareStats,
} from './types';
