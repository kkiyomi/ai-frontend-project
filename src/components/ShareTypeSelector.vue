<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-4">What would you like to share?</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <label 
        v-for="option in shareOptions" 
        :key="option.value"
        class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <input
          :value="option.value"
          :checked="modelValue === option.value"
          @change="$emit('update:modelValue', option.value)"
          type="radio"
          class="mt-1 text-blue-600 focus:ring-blue-500"
        />
        <div class="flex-1">
          <div class="font-medium text-gray-900">{{ option.title }}</div>
          <div class="text-sm text-gray-500">{{ option.description }}</div>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ShareOption {
  value: 'chapter' | 'chapters' | 'series' | 'multiple-series';
  title: string;
  description: string;
}

interface Props {
  modelValue: string;
}

defineProps<Props>();
defineEmits<{
  'update:modelValue': [value: string];
}>();

const shareOptions: ShareOption[] = [
  {
    value: 'chapter',
    title: 'Single Chapter',
    description: 'Share one specific chapter'
  },
  {
    value: 'chapters',
    title: 'Multiple Chapters',
    description: 'Select specific chapters to share'
  },
  {
    value: 'series',
    title: 'Complete Series',
    description: 'Share all chapters from one series'
  },
  {
    value: 'multiple-series',
    title: 'Multiple Series',
    description: 'Share multiple complete series'
  }
];
</script>