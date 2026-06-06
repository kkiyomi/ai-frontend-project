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
    <div v-else-if="chapterData">
      <!-- Top bar: gear icon -->
      <div class="sticky top-0 z-10 flex justify-end px-4 py-2 bg-base-100/80 backdrop-blur border-b border-base-200">
        <button
          @click="showSettings = true"
          class="btn btn-ghost btn-sm btn-circle"
          :class="{ 'btn-active': autoScrollActive }"
          title="Reader Settings"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <!-- Auto-scroll indicator -->
        <span v-if="autoScrollActive" class="text-xs text-primary font-medium ml-1">⏵</span>
      </div>

      <div class="mx-auto px-4 py-12" :style="{ maxWidth: pageWidth + 'px' }">
        <!-- Header -->
        <header class="mb-8 text-center">
          <p class="text-sm text-base-content/50 mb-2">
            <router-link
              v-if="isPartOfSeries"
              :to="`/s/${seriesUuid}`"
              class="hover:text-primary transition-colors no-underline"
            >
              ← {{ chapterData.seriesName }}
            </router-link>
            <span v-else>{{ chapterData.seriesName }}</span>
          </p>
          <h1 class="text-3xl font-bold" :class="fontClass">{{ chapterData.title }}</h1>

          <!-- Owner actions -->
          <div v-if="store.isOwner" class="mt-3 flex justify-center gap-2">
            <button
              v-if="chapterId"
              @click="togglePublish"
              class="btn btn-xs"
              :class="isPublished ? 'btn-success' : 'btn-ghost'"
            >
              {{ isPublished ? 'Published ✓' : 'Publish' }}
            </button>
          </div>
        </header>

        <!-- Translated content -->
        <article
          class="prose prose-lg max-w-none leading-relaxed"
          :class="fontClass"
          :style="articleStyle"
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
              <dt class="font-medium" :class="fontClass">
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

      <!-- Reader Settings Modal -->
      <ReaderSettings v-if="showSettings" @close="showSettings = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useShareStore } from '../store';
import {
  font,
  fontSize,
  lineSpacing,
  paragraphSpacing,
  pageWidth,
  autoScroll,
} from '../composables/useReaderSettings';
import ReaderSettings from './ReaderSettings.vue';

const route = useRoute();
const store = useShareStore();

const chapterData = computed(() => store.chapterData);
const error = computed(() => store.error);
const loading = computed(() => store.loading);
const isPartOfSeries = computed(() => !!route.params.seriesUuid);
const seriesUuid = computed(() => route.params.seriesUuid as string);
const chapterId = computed(() => route.params.chapterUuid as string);
const isPublished = ref(true);

const showSettings = ref(false);

// Font class mapping
const fontClass = computed(() => {
  switch (font.value) {
    case 'roboto': return 'font-roboto';
    case 'lora': return 'font-lora';
    case 'dyslexic': return 'font-dyslexic';
    default: return 'font-serif';
  }
});

// Article style
const articleStyle = computed(() => ({
  fontSize: fontSize.value + 'px',
  lineHeight: lineSpacing.value,
  '--paragraph-spacing': paragraphSpacing.value + 'em',
}));

// Auto-scroll
const autoScrollActive = ref(false);
let scrollRAF: number | null = null;

function startAutoScroll() {
  if (scrollRAF) return;
  autoScrollActive.value = true;
  let lastTime = performance.now();
  function step(now: number) {
    const delta = (now - lastTime) / 1000;
    lastTime = now;
    window.scrollBy({ top: delta * 30, behavior: 'auto' });
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 5;
    if (!atBottom) {
      scrollRAF = requestAnimationFrame(step);
    } else {
      autoScrollActive.value = false;
      scrollRAF = null;
    }
  }
  scrollRAF = requestAnimationFrame(step);
}

function stopAutoScroll() {
  if (scrollRAF) cancelAnimationFrame(scrollRAF);
  scrollRAF = null;
  autoScrollActive.value = false;
}

watch(autoScroll, (v) => {
  if (v) startAutoScroll();
  else stopAutoScroll();
});

onUnmounted(() => stopAutoScroll());

async function togglePublish() {
  const cid = chapterId.value;
  if (!cid) return;
  const newState = !isPublished.value;
  await store.toggleChapterPublish(cid, newState);
  isPublished.value = newState;
}

onMounted(async () => {
  const chapterUuid = route.params.chapterUuid as string | undefined;
  const seriesUid = route.params.seriesUuid as string | undefined;

  if (seriesUid) {
    await store.loadSharedChapterInSeries(seriesUid, chapterUuid!);
  } else if (chapterUuid) {
    await store.loadSharedChapter(chapterUuid);
  }

  if (store.currentLink) {
    isPublished.value = store.currentLink.active;
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Roboto:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400&display=swap');

.font-serif {
  font-family: 'Merriweather', Georgia, serif;
}
.font-roboto {
  font-family: 'Roboto', system-ui, sans-serif;
}
.font-lora {
  font-family: 'Lora', Georgia, serif;
}
.font-dyslexic {
  font-family: 'Comic Sans MS', 'OpenDyslexic', system-ui, sans-serif;
}

article :deep(p + p) {
  margin-top: var(--paragraph-spacing);
}
</style>
