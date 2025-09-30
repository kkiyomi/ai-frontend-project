<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Share Title</label>
        <input
          :value="title"
          @input="$emit('update:title', ($event.target as HTMLInputElement).value)"
          type="text"
          :placeholder="defaultTitle"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Expiration</label>
        <select
          :value="expiration"
          @change="$emit('update:expiration', ($event.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="365">1 year</option>
          <option value="0">Never expires</option>
        </select>
      </div>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
      <textarea
        :value="description"
        @input="$emit('update:description', ($event.target as HTMLTextAreaElement).value)"
        rows="3"
        placeholder="Add a description for your shared content..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
      ></textarea>
    </div>

    <!-- Password Protection -->
    <div class="flex items-center space-x-3">
      <input
        :checked="passwordProtected"
        @change="$emit('update:passwordProtected', ($event.target as HTMLInputElement).checked)"
        type="checkbox"
        id="password-protect"
        class="text-blue-600 focus:ring-blue-500"
      />
      <label for="password-protect" class="text-sm font-medium text-gray-700">Password protect this share</label>
    </div>
    
    <div v-if="passwordProtected">
      <input
        :value="password"
        @input="$emit('update:password', ($event.target as HTMLInputElement).value)"
        type="password"
        placeholder="Enter password"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  expiration: string;
  passwordProtected: boolean;
  password: string;
  defaultTitle: string;
}

defineProps<Props>();

defineEmits<{
  'update:title': [value: string];
  'update:description': [value: string];
  'update:expiration': [value: string];
  'update:passwordProtected': [value: boolean];
  'update:password': [value: string];
}>();
</script>