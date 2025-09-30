import type { Directive, DirectiveBinding } from 'vue';
import { useGlossaryStore } from './store';

/**
 * v-glossary Directive
 *
 * Automatically highlights glossary terms in text content and shows tooltips on hover
 *
 * Usage:
 * ```vue
 * <div v-glossary>{{ translatedText }}</div>
 * ```
 *
 * The directive will:
 * 1. Detect when highlight mode is enabled
 * 2. Find all glossary terms in the text
 * 3. Wrap them in spans with appropriate classes
 * 4. Add hover tooltips showing term definitions
 */

interface GlossaryElement extends HTMLElement {
  _glossaryCleanup?: () => void;
  _glossaryOriginalContent?: string;
}

export const vGlossary: Directive = {
  mounted(el: GlossaryElement, binding: DirectiveBinding) {
    const store = useGlossaryStore();

    el._glossaryOriginalContent = el.textContent || '';

    const updateHighlights = () => {
      if (!store.isHighlightEnabled.value) {
        if (el._glossaryOriginalContent) {
          el.textContent = el._glossaryOriginalContent;
        }
        return;
      }

      const text = el._glossaryOriginalContent || el.textContent || '';
      const highlighted = store.highlightTermsInText(text);
      el.innerHTML = highlighted;

      const glossarySpans = el.querySelectorAll('.glossary-popup');
      glossarySpans.forEach(span => {
        const termId = span.getAttribute('data-term-id');
        if (!termId) return;

        const term = store.terms.value.find(t => t.id === termId);
        if (!term) return;

        span.addEventListener('mouseenter', (e) => {
          const tooltip = document.createElement('div');
          tooltip.className = 'glossary-tooltip absolute z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 max-w-xs';
          tooltip.style.position = 'fixed';
          tooltip.innerHTML = `
            <div class="font-semibold">${term.term}</div>
            <div class="text-green-400">${term.translation}</div>
            ${term.definition ? `<div class="text-gray-300 mt-1">${term.definition}</div>` : ''}
          `;

          document.body.appendChild(tooltip);

          const rect = (e.target as HTMLElement).getBoundingClientRect();
          tooltip.style.left = `${rect.left}px`;
          tooltip.style.top = `${rect.bottom + 5}px`;

          span.setAttribute('data-tooltip-id', Math.random().toString());

          span.addEventListener('mouseleave', () => {
            tooltip.remove();
          }, { once: true });
        });
      });
    };

    updateHighlights();

    const observer = new MutationObserver(() => {
      if (el._glossaryOriginalContent !== el.textContent) {
        el._glossaryOriginalContent = el.textContent || '';
        updateHighlights();
      }
    });

    observer.observe(el, { childList: true, characterData: true, subtree: true });

    el._glossaryCleanup = () => {
      observer.disconnect();
    };
  },

  updated(el: GlossaryElement) {
    const store = useGlossaryStore();

    if (!store.isHighlightEnabled.value) {
      if (el._glossaryOriginalContent) {
        el.textContent = el._glossaryOriginalContent;
      }
      return;
    }

    const text = el._glossaryOriginalContent || el.textContent || '';
    const highlighted = store.highlightTermsInText(text);
    if (el.innerHTML !== highlighted) {
      el.innerHTML = highlighted;
    }
  },

  unmounted(el: GlossaryElement) {
    if (el._glossaryCleanup) {
      el._glossaryCleanup();
    }
  }
};
