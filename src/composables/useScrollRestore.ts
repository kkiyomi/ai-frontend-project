import { onMounted, onUnmounted, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';

const STORAGE_KEY = 'share_scroll_pos';

function loadPositions(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(path: string, top: number) {
  try {
    const pos = loadPositions();
    if (top <= 5) {
      delete pos[path];
    } else {
      pos[path] = top;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    /* quota exceeded, ignore */
  }
}

/**
 * Saves scroll position on scroll (debounced) and restores it
 * on mount after content is ready. Handles page refresh gracefully.
 *
 * @param ready - A ref that becomes `true` when the page content has loaded
 *                and the DOM is tall enough for scroll restoration.
 */
export function useScrollRestore(ready: Ref<boolean>) {
  const route = useRoute();
  const getPath = () => route.fullPath;

  let scrollTimer: ReturnType<typeof setTimeout> | null = null;

  function onScroll() {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      save(getPath(), window.scrollY);
    }, 150);
  }

  function restore() {
    const top = loadPositions()[getPath()];
    if (top && top > 5) {
      requestAnimationFrame(() => {
        window.scrollTo({ top, behavior: 'instant' });
      });
    }
  }

  // Restore once content is loaded
  if (ready.value) {
    // Already loaded (e.g. store has cached data from previous route)
    restore();
  } else {
    const stopWatch = watch(ready, (isReady) => {
      if (isReady) {
        restore();
        stopWatch();
      }
    });
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll);
    if (scrollTimer) clearTimeout(scrollTimer);
    // Persist final position before navigating away
    save(getPath(), window.scrollY);
  });

  // Guard against browser's native scroll restoration on refresh
  if (typeof window !== 'undefined' && typeof history !== 'undefined') {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.addEventListener('beforeunload', () => {
      save(getPath(), window.scrollY);
    });
  }
}
