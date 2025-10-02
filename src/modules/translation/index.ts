/**
 * Translation Module - Public API
 *
 * The Translation module manages all translation operations and state.
 *
 * Features:
 * - Store: Reactive state for translation progress and status
 * - Components: UI elements for translation controls and feedback
 * - API: Translation endpoints with automatic mock/real switching
 * - Types: Translation-specific types and interfaces
 *
 * Integration Example:
 * ```typescript
 * // In a page component
 * import { useTranslationStore, TranslationProgress } from '@/modules/translation';
 *
 * const translation = useTranslationStore();
 *
 * // Translate a single paragraph
 * const result = await translation.translateParagraph(text, glossaryContext);
 *
 * // Translate an entire chapter
 * const translations = await translation.translateChapter(paragraphs, glossaryContext);
 *
 * // Watch translation progress
 * watch(translation.translationProgress, (progress) => {
 *   console.log(`Translation progress: ${progress}%`);
 * });
 * ```
 *
 * Using Translation Components:
 * ```vue
 * <template>
 *   <TranslationToolbar
 *     :isTranslating="translation.isTranslating.value"
 *     @translate="handleTranslate"
 *   />
 *   <TranslationProgress
 *     :progress="translation.translationProgress.value"
 *     :isVisible="translation.isTranslating.value"
 *   />
 * </template>
 * ```
 *
 * API Configuration:
 * - Mock mode: Set VITE_USE_MOCK_API=true in .env
 * - Real mode: Set VITE_USE_MOCK_API=false and configure VITE_API_BASE_URL
 * - Translation module handles switching internally via Core's environment utils
 */

export { useTranslationStore } from './store';

export { default as TranslationProgress } from './components/TranslationProgress.vue';
export { default as TranslationStatus } from './components/TranslationStatus.vue';
export { default as TranslationToolbar } from './components/TranslationToolbar.vue';

export type {
  TranslationState,
  TranslationRequest,
  ParagraphTranslationRequest,
  RetranslationRequest,
  ChapterTranslationRequest
} from './types';
