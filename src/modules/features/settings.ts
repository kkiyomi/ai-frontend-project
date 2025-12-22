import { defineComponent, computed } from 'vue';
import { useSettingsStore } from '@/modules/core';
import { useFeaturesStore } from './store';

export const FeatureFlagsSection = defineComponent({
  name: 'FeatureFlagsSection',
  props: {
    section: {
      type: Object,
      required: true
    }
  },
  setup() {
    const features = useFeaturesStore();
    const flagList = computed(() => Object.values(features.flags));
    return { flagList, features };
  },
  template: `
    <div class="space-y-6">
      <div v-for="flag in flagList" :key="flag.id" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">{{ flag.name }}</label>
        <p v-if="flag.description" class="text-xs text-gray-500">{{ flag.description }}</p>
        <div class="flex items-center">
          <input type="checkbox" :checked="flag.enabled" @change="features.toggle(flag.id)" class="text-blue-600 focus:ring-blue-500" />
          <span class="ml-2 text-sm text-gray-700">{{ flag.name }}</span>
        </div>
      </div>
    </div>
  `
});

export function registerFeatureSettings() {
  const settings = useSettingsStore();
  settings.registerSection({
    id: 'feature-flags',
    title: 'Feature Flags',
    description: 'Enable or disable experimental features (developers only)',
    icon: '⚡',
    component: FeatureFlagsSection,
    items: []
  });
}
