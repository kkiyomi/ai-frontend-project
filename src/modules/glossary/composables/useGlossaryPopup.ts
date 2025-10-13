import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { GlossaryTerm } from '../types';
import { useGlossaryStore } from '../store';

const { terms: glossaryTerms, isHighlightEnabled } = useGlossaryStore();

export function useGlossaryPopup() {
  const showPopup = ref(false);
  const hoveredTerm = ref<GlossaryTerm | null>(null);
  const popupPosition = ref({ x: 0, y: 0 });

  function calculateTooltipPosition(event: MouseEvent, tooltipEl?: HTMLElement) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    const margin = 8;
    const tooltipWidth = tooltipEl?.offsetWidth || 300;
    const tooltipHeight = tooltipEl?.offsetHeight || 180;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = rect.left + rect.width / 2 - tooltipWidth / 2;
    let y = rect.bottom + margin;

    if (x + tooltipWidth > viewportWidth - margin) x = viewportWidth - tooltipWidth - margin;
    if (x < margin) x = margin;
    if (y + tooltipHeight > viewportHeight - margin) y = rect.top - tooltipHeight - margin;
    if (y < margin) y = margin;

    return { x, y };
  }

  function handleGlossaryHover(event: MouseEvent) {
    if (!isHighlightEnabled.value) return;

    const target = event.target as HTMLElement;
    if (!target.classList.contains('glossary-highlight')) return;

    const termId = target.getAttribute('data-term-id');
    if (!termId) return;

    const term = glossaryTerms.value.find(t => t.id === termId);
    if (!term) return;

    const tooltipEl = document.querySelector('div.glossary-popup') as HTMLElement | undefined;

    popupPosition.value = calculateTooltipPosition(event, tooltipEl);
    hoveredTerm.value = term;
    showPopup.value = true;
  }

  function handleGlossaryMouseOut(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;

    if (relatedTarget && (relatedTarget.closest('.glossary-popup') || target.classList.contains('glossary-highlight'))) {
      return;
    }

    setTimeout(() => {
      if (!document.querySelector('.glossary-popup:hover')) {
        showPopup.value = false;
        hoveredTerm.value = null;
      }
    }, 100);
  }

  function handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.glossary-popup') && !target.classList.contains('glossary-highlight')) {
      closePopup();
    }
  }

  function closePopup() {
    showPopup.value = false;
    hoveredTerm.value = null;
  }

  onMounted(() => {
    document.addEventListener('mouseover', handleGlossaryHover);
    document.addEventListener('mouseout', handleGlossaryMouseOut);
    document.addEventListener('click', handleDocumentClick);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('mouseover', handleGlossaryHover);
    document.removeEventListener('mouseout', handleGlossaryMouseOut);
    document.removeEventListener('click', handleDocumentClick);
  });

  return {
    showPopup,
    hoveredTerm,
    popupPosition,
    closePopup
  };
}
