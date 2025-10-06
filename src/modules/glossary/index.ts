/**
 * Glossary Module - Public API
 *
 * The Glossary module manages translation consistency through glossary terms.
 *
 * Features:
 * - Store: Reactive state management for glossary terms
 * - Components: UI for viewing/editing glossary terms with popup tooltips
 * - Directive: Auto-highlighting of terms in translated text
 * - API: CRUD operations with automatic mock/real switching
 *
 * Integration Example:
 * ```typescript
 * // In main.ts
 * import { vGlossary } from '@/modules/glossary';
 * app.directive('glossary', vGlossary);
 *
 * // In components
 * import { useGlossaryStore, GlossaryPanel } from '@/modules/glossary';
 *
 * const glossary = useGlossaryStore();
 * await glossary.loadTerms(seriesId, chapterId);
 * ```
 *
 * Using the v-glossary directive for auto-highlighting:
 * ```vue
 * <template>
 *   <div v-glossary>{{ translatedText }}</div>
 * </template>
 * ```
 *
 * API Configuration:
 * - Mock mode: Set VITE_USE_MOCK_API=true in .env
 * - Real mode: Set VITE_USE_MOCK_API=false and configure VITE_API_BASE_URL
 * - Glossary module handles switching internally via Core's environment utils
 */

export { useGlossaryStore } from './store';

export { default as GlossaryPanel } from './components/GlossaryPanel.vue';
export { default as GlossaryTermPopup } from './components/GlossaryTermPopup.vue';

export type { GlossaryTerm } from './types';
