/**
 * Core Module - Virtual Scrolling Composable
 *
 * Generic virtual scrolling implementation for efficiently rendering large lists.
 * Supports dynamic height measurement, IntersectionObserver-based scrolling,
 * and manual scroll jump detection.
 *
 * Design Decisions:
 * 1. Generic item type `T` for type safety.
 * 2. Support both fixed and dynamic item heights.
 * 3. Automatic height cache reset when items array length changes significantly.
 * 4. Cleanup of IntersectionObserver on unmount.
 *
 * Usage Example:
 * ```typescript
 * const {
 *   visibleItems,
 *   topSpacer,
 *   bottomSpacer,
 *   containerRef,
 *   setItemRef,
 *   handleScroll
 * } = useVirtualScroll({
 *   items: myItems,
 *   visibleCount: 60,
 *   buffer: 10,
 *   estimateItemHeight: 40
 * });
 * ```
 */

import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  watchEffect,
  isRef,
  type Ref,
  type ComponentPublicInstance,
} from 'vue';
import type { UseVirtualScrollOptions, VirtualScrollApi } from '../types/virtualScroll';

export function useVirtualScroll<T>(
  options: UseVirtualScrollOptions<T>
): VirtualScrollApi<T> {
  const {
    items,
    visibleCount = 60,
    buffer = 10,
    estimateItemHeight,
    scrollContainer: externalContainerRef,
  } = options;

  // Convert items to a ref if it's not already reactive
  const itemsRef = Array.isArray(items) ? ref<T[]>(items) : items;

  // Helper to deeply unwrap nested refs until we get an HTMLElement ref
  const toDeepElementRef = (input: any): Ref<HTMLElement | null> => {
    if (input === undefined || input === null) {
      return ref<HTMLElement | null>(null);
    }
    // If it's a ref, unwrap its value recursively
    if (isRef(input)) {
      // Keep unwrapping while value is also a ref
      let current = input;
      while (isRef(current) && isRef(current.value)) {
        current = current.value;
      }
      // At this point, current is a ref whose value may be HTMLElement | null
      // Ensure we return a ref that stays reactive
      if (current === input) {
        // No nesting, return original
        return current as Ref<HTMLElement | null>;
      }
      // Return the deepest ref (still reactive)
      return current as Ref<HTMLElement | null>;
    }
    // input is HTMLElement (raw element), wrap in ref
    return ref<HTMLElement | null>(input);
  };

  // Normalize scroll container to a ref
  const containerRef = toDeepElementRef(externalContainerRef);

  // Virtual window state
  const startIndex = ref(0);
  const itemRefs = ref<HTMLElement[]>([]);

  // Height tracking
  const heights = ref<Record<number, number>>({});

  // Visible items slice
  const visibleItems = computed<T[]>(() => {
    const start = startIndex.value;
    const end = start + visibleCount;
    return (itemsRef.value as T[]).slice(start, end);
  });

  // Height estimation
  const avgHeight = computed<number>(() => {
    // If we have cached heights, compute average
    const cachedHeights = Object.values(heights.value);
    if (cachedHeights.length > 0) {
      return cachedHeights.reduce((a, b) => a + b, 0) / cachedHeights.length;
    }

    // If estimateItemHeight is a number, use it
    if (typeof estimateItemHeight === 'number') {
      return estimateItemHeight;
    }

    // If estimateItemHeight is a function, compute average over visible items
    if (typeof estimateItemHeight === 'function') {
      const sampleIndices = Array.from(
        { length: Math.min(10, (itemsRef.value as T[]).length) },
        (_, i) => i
      );
      const sampleHeights = sampleIndices.map(estimateItemHeight);
      if (sampleHeights.length > 0) {
        return sampleHeights.reduce((a, b) => a + b, 0) / sampleHeights.length;
      }
    }

    // Default fallback
    return 40;
  });

  // Spacer calculations
  const topSpacer = computed<number>(() => {
    return startIndex.value * avgHeight.value;
  });

  const bottomSpacer = computed<number>(() => {
    const remaining = (itemsRef.value as T[]).length - (startIndex.value + visibleCount);
    return Math.max(0, remaining * avgHeight.value);
  });

  // Window shifting
  function shiftWindow(newStart: number) {
    const maxStart = (itemsRef.value as T[]).length - visibleCount;
    startIndex.value = Math.max(0, Math.min(newStart, maxStart));
  }

  // Height measurement
  function updateHeight(index: number, height: number) {
    heights.value[index] = height;
  }

  function resetHeights() {
    heights.value = {};
  }

  // Item reference setting
  function setItemRef(el: Element | ComponentPublicInstance | null, i: number) {
    if (!el) return;

    // Extract HTMLElement from Vue ref (could be ComponentPublicInstance)
    const element = (el as ComponentPublicInstance).$el || (el as Element);
    if (!(element instanceof HTMLElement)) {
      return;
    }

    itemRefs.value[i] = element;

    // Measure height after DOM update
    nextTick(() => {
      const height = element.offsetHeight;
      const absoluteIndex = startIndex.value + i;
      updateHeight(absoluteIndex, height);
    });
  }

  // IntersectionObserver
  let observer: IntersectionObserver | undefined;

  function handleIntersect(entries: IntersectionObserverEntry[]) {
    const visible = entries
      .filter(e => e.isIntersecting)
      .map(e => itemRefs.value.indexOf(e.target as HTMLElement))
      .filter(idx => idx >= 0) // Filter out -1 indices
      .sort((a, b) => a - b);

    if (!visible.length) return;

    const first = visible[0];
    const last = visible[visible.length - 1];

    // Scroll down
    if (last >= visibleCount - buffer) {
      shiftWindow(startIndex.value + buffer);
    }

    // Scroll up
    if (first <= buffer) {
      shiftWindow(startIndex.value - buffer);
    }
  }

  // Scroll jump detection
  function handleScroll() {
    const el = containerRef.value;
    if (!el) {
      return;
    }

    const scrollTop = el.scrollTop;
    const estimatedIndex = Math.floor(scrollTop / avgHeight.value);

    // If user jumps far, force sync
    if (Math.abs(estimatedIndex - startIndex.value) > visibleCount) {
      shiftWindow(estimatedIndex - buffer);
    }
  }

  // Track whether we're using an external scroll container
  const hasExternalContainer = externalContainerRef !== undefined && externalContainerRef !== null;

  // Setup IntersectionObserver and scroll listeners when container is available
  let cleanupScrollListener: (() => void) | undefined;
  let stopItemRefsWatch: (() => void) | undefined;

  const setupObservers = () => {
    // Clean up any existing observers and listeners
    observer?.disconnect();
    cleanupScrollListener?.();
    stopItemRefsWatch?.();

    const containerEl = containerRef.value;
    if (!containerEl) {
      return;
    }
    
    // Debug: log container dimensions
    console.log('[VirtualScroll] setupObservers - container dimensions', {
      hasExternalContainer,
      offsetHeight: containerEl.offsetHeight,
      clientHeight: containerEl.clientHeight,
      scrollHeight: containerEl.scrollHeight,
      tagName: containerEl.tagName,
      className: containerEl.className,
    });

    // Create IntersectionObserver with container as root
    observer = new IntersectionObserver(handleIntersect, {
      root: containerEl,
      threshold: 0.1,
    });

    // Observe item refs
    stopItemRefsWatch = watchEffect(() => {
      if (!observer) return;
      observer.disconnect();
      itemRefs.value.forEach(el => el && observer!.observe(el));
    });

    // Only attach scroll event listener for external containers
    // Internal containers will have @scroll handler in the component
    if (hasExternalContainer) {
      containerEl.addEventListener('scroll', handleScroll);
      cleanupScrollListener = () => {
        containerEl.removeEventListener('scroll', handleScroll);
      };
    }
  };

  // Watch for container ref changes (e.g., when template ref is assigned)
  watch(
    () => containerRef.value,
    () => {
      setupObservers();
    },
    { flush: 'post' } // Wait for DOM to be updated
  );

  // Initial setup
  onMounted(() => {
    // If container is already available, set up immediately
    if (containerRef.value) {
      setupObservers();
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
    cleanupScrollListener?.();
    stopItemRefsWatch?.();
  });

  // Reset height cache when items length changes significantly
  watch(
    () => (itemsRef.value as T[]).length,
    (newLength, oldLength) => {
      const lengthChange = Math.abs(newLength - oldLength);
      // Reset cache if length changed by more than 20% or more than 100 items
      if (lengthChange > Math.max(newLength * 0.2, 100)) {
        resetHeights();
      }
    }
  );

  // Return API
  return {
    visibleItems,
    startIndex,
    topSpacer,
    bottomSpacer,
    containerRef,
    setItemRef,
    handleScroll,
    updateHeight,
    resetHeights,
  };
}