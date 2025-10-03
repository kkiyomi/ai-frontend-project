import { realSharingAPI } from './real';
import { mockSharingAPI } from './mock';
import { isMockMode } from '../../core/utils/environment';

/**
 * Sharing API - automatically switches between mock and real APIs
 *
 * How to switch modes:
 * 1. Set environment variable: VITE_USE_MOCK_API=true (for mock)
 * 2. Or modify the environment check in core/utils/environment.ts
 *
 * Usage in components:
 * import { sharingAPI } from '@/modules/sharing';
 *
 * const result = await sharingAPI.createShare({
 *   chapterIds: ['ch1'],
 *   seriesIds: [],
 *   title: 'Chapter 1 Translation'
 * });
 */

export const sharingAPI = isMockMode() ? mockSharingAPI : realSharingAPI;

export { realSharingAPI, mockSharingAPI };
