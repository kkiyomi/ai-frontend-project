<template>
  <div class="p-4 bg-blue-50 rounded-lg">
    <h4 class="font-medium text-gray-900 mb-2">Share Preview</h4>
    <div class="text-sm text-gray-600 space-y-1">
      <p><strong>Content:</strong> {{ contentSummary }}</p>
      <p v-if="stats"><strong>Progress:</strong> {{ stats.translatedParagraphs }}/{{ stats.totalParagraphs }} paragraphs translated ({{ stats.translationProgress }}%)</p>
      <p><strong>Expires:</strong> {{ expiration === '0' ? 'Never' : `${expiration} days` }}</p>
      <p v-if="passwordProtected"><strong>Password:</strong> Protected</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ShareStats {
  totalChapters: number;
  totalSeries: number;
  totalParagraphs: number;
  translatedParagraphs: number;
  translationProgress: number;
}

interface Props {
  contentSummary: string;
  stats: ShareStats | null;
  expiration: string;
  passwordProtected: boolean;
}

defineProps<Props>();
</script>