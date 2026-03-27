<template>
  <div
    v-if="hasExternalScrollContainer"
    :class="['virtual-scrolling-list h-full', props.class]"
    :style="[containerStyle, props.style]"
  >
    <div :style="{ height: topSpacer + 'px' }" />
    <template v-for="(item, i) in visibleItems" :key="getItemKey(item, i)">
      <div :ref="el => setItemRef(el, i)">
        <slot
          name="item"
          :item="item"
          :index="startIndex + i"
          :absoluteIndex="startIndex + i"
        >
          <!-- Default slot fallback: render item as string -->
          {{ item }}
        </slot>
      </div>
    </template>
    <div :style="{ height: bottomSpacer + 'px' }" />
  </div>
  <div
    v-else
    ref="containerRef"
    :class="['virtual-scrolling-list overflow-y-auto h-full', props.class]"
    :style="[containerStyle, props.style]"
    @scroll="handleScroll"
  >
    <div :style="{ height: topSpacer + 'px' }" />
    <template v-for="(item, i) in visibleItems" :key="getItemKey(item, i)">
      <div :ref="el => setItemRef(el, i)">
        <slot
          name="item"
          :item="item"
          :index="startIndex + i"
          :absoluteIndex="startIndex + i"
        >
          <!-- Default slot fallback: render item as string -->
          {{ item }}
        </slot>
      </div>
    </template>
    <div :style="{ height: bottomSpacer + 'px' }" />
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, type Ref } from 'vue';
import { useVirtualScroll } from '../composables/useVirtualScroll';
import type { VirtualScrollingListProps } from '../types/virtualScroll';

const props = withDefaults(defineProps<VirtualScrollingListProps<T>>(), {
  visibleCount: 60,
  buffer: 10,
  itemKey: 'id' as keyof T,
});

const emit = defineEmits<{
  scroll: [event: Event];
}>();

const hasExternalScrollContainer = computed(() => !!props.scrollContainer);

// Use the virtual scroll composable
const {
  visibleItems,
  startIndex,
  topSpacer,
  bottomSpacer,
  containerRef,
  setItemRef,
  handleScroll: handleVirtualScroll,
} = useVirtualScroll({
  items: computed(() => props.items),
  visibleCount: props.visibleCount,
  buffer: props.buffer,
  estimateItemHeight: props.estimateItemHeight,
  scrollContainer: props.scrollContainer,
});

// Compute container style (can be overridden via class/style)
const containerStyle = computed(() => ({
  // Ensure container has a height; parent should set height
}));

// Get unique key for each item
function getItemKey(item: T, index: number): string | number {
  const keyProp = props.itemKey;
  if (keyProp && item && typeof item === 'object' && keyProp in item) {
    const keyValue = item[keyProp];
    if (typeof keyValue === 'string' || typeof keyValue === 'number') {
      return keyValue;
    }
  }
  // Fallback to index
  return startIndex.value + index;
}

// Handle scroll event and emit
function handleScroll(event: Event) {
  handleVirtualScroll();
  emit('scroll', event);
}
</script>

<style scoped>
.virtual-scrolling-list {
  /* Ensure container is a block element */
  display: block;
  /* Height must be set by parent */
}
</style>