/**
 * Glossary Module - Public API
 *
 * Manages glossary terms for translation consistency:
 * - Store: Reactive state management for terms
 * - Components: UI for viewing/editing terms
 * - Directive: Auto-highlighting terms in text
 * - API: CRUD operations through Core module
 *
 * Integration Guide:
 * ```typescript
 * // In main.ts or app setup
 * import { vGlossary } from '@/modules/glossary';
 * app.directive('glossary', vGlossary);
 *
 * // In components
 * import { useGlossaryStore } from '@/modules/glossary';
 * import { GlossaryPanel } from '@/modules/glossary';
 *
 * const glossary = useGlossaryStore();
 * glossary.loadTerms(seriesId, chapterId);
 * ```
 *
 * Using the v-glossary directive:
 * ```vue
 * <template>
 *   <div v-glossary>{{ translatedText }}</div>
 * </template>
 * ```
 * The directive automatically highlights glossary terms and shows tooltips.
 */

export { useGlossaryStore } from './store';
export { createGlossaryAPI } from './api';
export { vGlossary } from './directive';

export { default as GlossaryPanel } from './components/GlossaryPanel.vue';
export { default as GlossaryTermPopup } from './components/GlossaryTermPopup.vue';

export type { GlossaryTerm } from './types';
