<template>
  <div class="min-h-screen bg-base-100">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen p-8">
      <div class="text-center max-w-md">
        <div class="text-6xl mb-4">📖</div>
        <h1 class="text-2xl font-bold text-error mb-2">Content Unavailable</h1>
        <p class="text-base-content/60">{{ error }}</p>
      </div>
    </div>

    <!-- Chapter content -->
    <div v-else-if="chapterData" class="max-w-3xl mx-auto px-4 py-12">
      <!-- Header -->
      <header class="mb-8 text-center">
        <p class="text-sm text-base-content/50 mb-2">{{ chapterData.seriesName }}</p>
        <h1 class="text-3xl font-bold font-serif">{{ chapterData.title }}</h1>
      </header>

      <!-- Translated content -->
      <article
        class="prose prose-lg max-w-none font-serif leading-relaxed"
        v-html="chapterData.content"
      ></article>

      <!-- Raw content (optional) -->
      <section v-if="chapterData.rawContent" class="mt-12 pt-8 border-t border-base-300">
        <h2 class="text-lg font-semibold text-base-content/50 mb-4">Original Text</h2>
        <article
          class="prose prose-base max-w-none text-base-content/60"
          v-html="chapterData.rawContent"
        ></article>
      </section>

      <!-- Glossary (optional) -->
      <section
        v-if="chapterData.glossary && chapterData.glossary.length > 0"
        class="mt-12 pt-8 border-t border-base-300"
      >
        <h2 class="text-lg font-semibold text-base-content/50 mb-4">Glossary</h2>
        <dl class="space-y-3">
          <div
            v-for="term in chapterData.glossary"
            :key="term.term"
            class="bg-base-200 rounded-lg p-3"
          >
            <dt class="font-medium font-serif">
              {{ term.term }}
              <span class="text-base-content/50 font-normal">→ {{ term.translation }}</span>
            </dt>
            <dd v-if="term.definition" class="text-sm text-base-content/60 mt-1">
              {{ term.definition }}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useShareStore } from '../store';

const route = useRoute();
const store = useShareStore();

const chapterData = computed(() => store.chapterData);
const error = computed(() => store.error);
const loading = computed(() => store.loading);

onMounted(async () => {
  const uuid = route.params.uuid as string;
  const chapterUuid = route.params.chapterUuid as string | undefined;
  if (!uuid) return;

  if (chapterUuid) {
    // Chapter viewed via series share: /s/:uuid/chapters/:chapterUuid
    await store.loadSharedChapterInSeries(uuid, chapterUuid);
  } else {
    // Standalone chapter share: /s/:uuid
    await store.loadSharedChapter(uuid);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap');

.font-serif {
  font-family: 'Merriweather', Georgia, serif;
}
</style>
