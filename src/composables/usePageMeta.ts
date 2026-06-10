import { watch, onUnmounted, type Ref } from 'vue';

const DEFAULT_TITLE = 'Absolute Mystery';

interface PageMeta {
  title: string;
  description?: string;
  ogType?: 'website' | 'article';
}

/**
 * Manages document title and meta tags (description, Open Graph).
 * Creates/updates <meta> elements in <head> and cleans up on unmount.
 *
 * Usage:
 *   usePageMeta(computed(() => ({ title: seriesName, description })));
 */
export function usePageMeta(meta: Ref<PageMeta | null>) {
  const createdElements: HTMLMetaElement[] = [];

  function ensureMeta(name: string, property?: string): HTMLMetaElement {
    // Try to find existing first, then by property
    let el = document.querySelector<HTMLMetaElement>(
      `meta[name="${name}"], meta[property="${name}"]`,
    );
    if (!el && property) {
      el = document.querySelector<HTMLMetaElement>(
        `meta[property="${property}"]`,
      );
    }
    if (!el) {
      el = document.createElement('meta');
      document.head.appendChild(el);
      createdElements.push(el);
    }
    return el;
  }

  function setMeta(el: HTMLMetaElement, name: string, property: string, content: string) {
    el.setAttribute(property ? 'property' : 'name', property || name);
    el.setAttribute('content', content);
  }

  function applyMeta(m: PageMeta | null) {
    if (!m || !m.title) {
      document.title = DEFAULT_TITLE;
      return;
    }

    document.title = m.title;

    // Description
    if (m.description) {
      const descEl = ensureMeta('description');
      setMeta(descEl, 'description', '', m.description);
    }

    // Open Graph
    const ogTitleEl = ensureMeta('og:title');
    setMeta(ogTitleEl, '', 'og:title', m.title);

    if (m.description) {
      const ogDescEl = ensureMeta('og:description');
      setMeta(ogDescEl, '', 'og:description', m.description);
    }

    const ogTypeEl = ensureMeta('og:type');
    setMeta(ogTypeEl, '', 'og:type', m.ogType || 'website');

    const ogUrlEl = ensureMeta('og:url');
    setMeta(ogUrlEl, '', 'og:url', window.location.href);

    // Twitter
    const twitterEl = ensureMeta('twitter:card');
    setMeta(twitterEl, '', 'twitter:card', 'summary');
  }

  watch(
    () => meta.value,
    (m) => applyMeta(m),
    { immediate: true },
  );

  onUnmounted(() => {
    document.title = DEFAULT_TITLE;
    for (const el of createdElements) {
      el.remove();
    }
  });
}
