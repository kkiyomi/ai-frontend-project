/**
 * Core Module - Virtual Scrolling Types
 *
 * Generic virtual scrolling system for efficiently rendering large lists.
 * Provides TypeScript interfaces for the `useVirtualScroll` composable and
 * `VirtualScrollingList` component.
 */

import type { Ref, ComponentPublicInstance } from 'vue';

/**
 * Options for the `useVirtualScroll` composable.
 */
export interface UseVirtualScrollOptions<T> {
  /**
   * The complete list of items to render.
   */
  items: Ref<T[]> | T[];

  /**
   * Number of items to render at once (visible window size).
   * @default 60
   */
  visibleCount?: number;

  /**
   * Buffer size for IntersectionObserver triggering.
   * Determines how many items beyond the visible window to keep rendered.
   * @default 10
   */
  buffer?: number;

  /**
   * Estimated height of each item in pixels.
   * Can be a fixed number or a function that returns height based on item index.
   * If not provided, dynamic height measurement will be used.
   */
  estimateItemHeight?: number | ((index: number) => number);

  /**
   * Optional reference to a scroll container element.
   * If not provided, the composable will create its own internal ref.
   */
  scrollContainer?: Ref<HTMLElement | null> | HTMLElement | null;
}

/**
 * API returned by the `useVirtualScroll` composable.
 */
export interface VirtualScrollApi<T> {
  /**
   * The subset of items currently visible within the virtual window.
   */
  visibleItems: Ref<T[]>;

  /**
   * Current start index of the visible window.
   */
  startIndex: Ref<number>;

  /**
   * Height in pixels for the top spacer element.
   */
  topSpacer: Ref<number>;

  /**
   * Height in pixels for the bottom spacer element.
   */
  bottomSpacer: Ref<number>;

  /**
   * Reference to the scroll container element.
   * Use this as `ref="containerRef"` in your template.
   */
  containerRef: Ref<HTMLElement | null>;

  /**
   * Function to set item element reference.
   * Use as `:ref="el => setItemRef(el, index)"` in your template.
   */
  setItemRef: (el: Element | ComponentPublicInstance | null, index: number) => void;

  /**
   * Scroll event handler for manual scroll jump detection.
   * Attach to `@scroll="handleScroll"` on the scroll container.
   */
  handleScroll: () => void;

  /**
   * Update height measurement for a specific item.
   * Called automatically by `setItemRef`, but can be called manually if needed.
   */
  updateHeight: (index: number, height: number) => void;

  /**
   * Reset the height cache (e.g., when items change significantly).
   */
  resetHeights: () => void;

  /**
   * Options for the `scrollToIndex` method.
   */
  scrollToIndexOptions?: {
    /**
     * Scroll behavior ('instant' | 'smooth', default 'instant').
     */
    behavior?: ScrollBehavior;
    /**
     * Where to position the item in the container.
     * - 'start': top of container (default)
     * - 'center': middle of container
     */
    align?: 'start' | 'center';
  };

  /**
   * Scroll to the item at the given index.
   * Shifts the virtual window and scrolls the container so the item is visible.
   * Skips scrolling if the item is already fully visible in the viewport.
   * @param index - The index of the item to scroll to
   * @param behaviorOrOptions - ScrollBehavior string or options object
   */
  scrollToIndex: (index: number, behaviorOrOptions?: ScrollBehavior | VirtualScrollApi<T>['scrollToIndexOptions']) => void;
}

/**
 * Props for the `VirtualScrollingList` component.
 */
export interface VirtualScrollingListProps<T> {
  /**
   * The complete list of items to render.
   */
  items: T[];

  /**
   * Number of items to render at once (visible window size).
   * @default 60
   */
  visibleCount?: number;

  /**
   * Buffer size for IntersectionObserver triggering.
   * @default 10
   */
  buffer?: number;

  /**
   * Estimated height of each item in pixels.
   * Can be a fixed number or a function that returns height based on item index.
   * If not provided, dynamic height measurement will be used.
   */
  estimateItemHeight?: number | ((index: number) => number);

  /**
   * Property name to use as unique key for each item.
   * Defaults to 'id'.
   */
  itemKey?: keyof T;

  /**
   * Optional reference to an external scroll container element.
   * If provided, the component will use this container for scrolling
   * instead of creating its own scrollable div.
   */
  scrollContainer?: Ref<HTMLElement | null> | HTMLElement | null;

  /**
   * CSS class to apply to the scroll container.
   */
  class?: string;

  /**
   * Inline style to apply to the scroll container.
   */
  style?: Record<string, string> | string;
}