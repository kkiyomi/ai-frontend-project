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
      <!-- Top bar: brand + gear icon -->
      <ShareBrandBar :title="chapterData?.title">
        <div class="flex items-center gap-1">
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
          <span v-if="autoScrollActive" class="text-xs text-primary font-medium">⏵</span>
        </div>
      </ShareBrandBar>

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
          v-html="htmlContent"
        ></article>

        <!-- Raw content (optional) -->
        <section v-if="chapterData.rawContent" class="mt-12 pt-8 border-t border-base-300">
          <h2 class="text-lg font-semibold text-base-content/50 mb-4">Original Text</h2>
          <article
            class="prose prose-base max-w-none text-base-content/60"
            v-html="htmlRawContent"
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

        <!-- Prev/Next navigation (series context only) -->
        <nav v-if="isPartOfSeries" class="mt-12 flex justify-between items-center">
          <button
            v-if="prevChapter"
            @click="goPrev"
            class="btn btn-ghost btn-sm gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            {{ prevChapter.name }}
          </button>
          <span v-else class="btn btn-ghost btn-sm btn-disabled">—</span>

          <span class="text-sm text-base-content/30">{{ currentIndex + 1 }} / {{ allChapters.length }}</span>

          <button
            v-if="nextChapter"
            @click="goNext"
            class="btn btn-ghost btn-sm gap-1"
          >
            {{ nextChapter.name }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
          <span v-else class="btn btn-ghost btn-sm btn-disabled">—</span>
        </nav>
      </div>

      <!-- Brand footer -->
      <ShareBrandFooter />

      <!-- Reader Settings Modal -->
      <ReaderSettings v-if="showSettings" @close="showSettings = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useShareStore } from '../store';
import { shareAPI } from '../api';
import { usePageMeta, useScrollRestore } from '@/composables';
import {
  font,
  fontSize,
  lineSpacing,
  paragraphSpacing,
  pageWidth,
  autoScroll,
  offlineEnabled,
  chaptersAhead,
  cacheChapter,
  getCachedChapter,
} from '../composables/useReaderSettings';
import ReaderSettings from './ReaderSettings.vue';
import ShareBrandBar from './ShareBrandBar.vue';
import ShareBrandFooter from './ShareBrandFooter.vue';

/** Convert plain text with \n to HTML paragraphs */
function nl2p(text: string): string {
  if (!text) return text;
  // Already contains HTML tags — return as-is
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text
    .split(/\n\n+/)
    .map((block) => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

const route = useRoute();
const router = useRouter();
const store = useShareStore();

// Page meta — sets document.title and og: meta tags for social sharing
const pageMeta = computed(() => {
  const d = store.chapterData;
  if (!d) return null;
  const APP = 'Absolute Mystery';
  const title = d.seriesName
    ? `${d.title} — ${d.seriesName} — ${APP}`
    : `${d.title} — ${APP}`;
  return {
    title,
    description: d.seriesName || undefined,
    ogType: 'article' as const,
  };
});
usePageMeta(pageMeta);

const chapterData = computed(() => store.chapterData);
const error = computed(() => store.error);
const loading = computed(() => store.loading);
const contentReady = computed(() => !loading.value && !!chapterData.value);
useScrollRestore(contentReady);
const isPartOfSeries = computed(() => !!route.params.seriesUuid);
const seriesUuid = computed(() => route.params.seriesUuid as string);
const chapterId = computed(() => route.params.chapterUuid as string);
const isPublished = computed(() => chapterData.value?.isPublished ?? false);

// Navigation (only in series context)
const allChapters = computed(() => store.seriesData?.chapters ?? []);
const currentIndex = computed(() => allChapters.value.findIndex((c) => c.uuid === chapterId.value));
const prevChapter = computed(() => currentIndex.value > 0 ? allChapters.value[currentIndex.value - 1] : null);
const nextChapter = computed(() => currentIndex.value < allChapters.value.length - 1 ? allChapters.value[currentIndex.value + 1] : null);

function goPrev() {
  if (prevChapter.value) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    store.loadSharedChapterInSeries(seriesUuid.value, prevChapter.value.uuid);
    router.replace(`/s/${seriesUuid.value}/${prevChapter.value.uuid}`);
  }
}

function goNext() {
  if (nextChapter.value) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    store.loadSharedChapterInSeries(seriesUuid.value, nextChapter.value.uuid);
    router.replace(`/s/${seriesUuid.value}/${nextChapter.value.uuid}`);
  }
}

// Arrow key navigation
function onKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.key === 'ArrowLeft') goPrev();
  if (e.key === 'ArrowRight') goNext();
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  stopAutoScroll();
});

const showSettings = ref(false);

const htmlContent = computed(() => nl2p(chapterData.value?.content ?? ''));
const htmlRawContent = computed(() => nl2p(chapterData.value?.rawContent ?? ''));

// Font class mapping
const fontClass = computed(() => {
  switch (font.value) {
    case 'inter': return 'font-inter';
    case 'roboto': return 'font-roboto';
    case 'lora': return 'font-lora';
    case 'dyslexic': return 'font-dyslexic';
    default: return 'font-inter';
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
}

onMounted(async () => {
    const chapterUuid = route.params.chapterUuid as string | undefined;
    const seriesUid = route.params.seriesUuid as string | undefined;

    if (seriesUid) {
      await store.loadSharedChapterInSeries(seriesUid, chapterUuid!);
    } else if (chapterUuid) {
      await store.loadSharedChapter(chapterUuid);
    }

    const uid = chapterId.value || chapterUuid;

    // Offline fallback: if the API call failed but we have a cached copy, use it
    if (uid && store.error && !store.chapterData) {
      const cached = getCachedChapter(uid);
      if (cached) {
        store.chapterData = {
          title: cached.title,
          seriesName: '',
          content: cached.content,
          rawContent: undefined,
          isPublished: true,
          glossary: [],
        };
        store.clearError();
      }
    }

    // Cache chapter for offline reading
    if (store.chapterData) {
      if (uid) {
        cacheChapter(uid, store.chapterData.title, store.chapterData.content);
      }
    }

    // Pre-fetch chapters ahead for offline reading
    triggerPrefetch(chapterUuid || chapterId.value);
  });

// React to offline toggle being enabled after page load
watch(offlineEnabled, (on) => {
  if (on) triggerPrefetch(chapterId.value);
});

// Cache + prefetch whenever chapter data changes (navigation)
watch(chapterData, (data) => {
  if (data && chapterId.value) {
    cacheChapter(chapterId.value, data.title, data.content);
    triggerPrefetch(chapterId.value);
  }
});

/** Pre-fetch next N chapters ahead of current position */
async function triggerPrefetch(currentUuid: string | undefined) {
  if (!currentUuid || !offlineEnabled.value || !isPartOfSeries.value || !store.seriesData) return;
  prefetchAhead(currentUuid);
}

async function prefetchAhead(currentUuid: string) {
  const chapters = allChapters.value;
  if (!chapters.length || !seriesUuid.value) return;

  const idx = chapters.findIndex((c) => c.uuid === currentUuid);
  if (idx < 0) return;

  const ahead = chapters.slice(idx + 1, idx + 1 + chaptersAhead.value);
  for (const ch of ahead) {
    if (getCachedChapter(ch.uuid)) continue;
    try {
      const data = await shareAPI.getSharedChapterInSeries(seriesUuid.value, ch.uuid);
      cacheChapter(ch.uuid, data.title, data.content);
    } catch { /* skip */ }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Roboto:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400&display=swap');

.font-inter {
  font-family: 'Inter', system-ui, sans-serif;
}
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
