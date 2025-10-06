<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Password Protection Modal -->
    <div v-if="sharedContent?.isPasswordProtected && !isPasswordVerified" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="text-center mb-6">
          <div class="text-4xl mb-3">🔒</div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Password Protected Content</h2>
          <p class="text-gray-600">This shared content is password protected. Please enter the password to view it.</p>
        </div>
        
        <form @submit.prevent="verifyPassword" class="space-y-4">
          <div>
            <input
              v-model="passwordInput"
              type="password"
              placeholder="Enter password"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': passwordError }"
              required
            />
            <p v-if="passwordError" class="text-red-600 text-sm mt-1">{{ passwordError }}</p>
          </div>
          
          <button
            type="submit"
            :disabled="isVerifyingPassword"
            class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ isVerifyingPassword ? 'Verifying...' : 'Access Content' }}
          </button>
        </form>
        
        <div class="mt-4 text-center">
          <router-link 
            to="/" 
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Translation Tool
          </router-link>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div v-if="!sharedContent?.isPasswordProtected || isPasswordVerified" class="bg-white border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ sharedContent?.title || 'Shared Translation' }}</h1>
            <p v-if="sharedContent?.description" class="text-gray-600 mt-1">{{ sharedContent.description }}</p>
          </div>
          <div class="flex items-center space-x-3">
            <div class="text-sm text-gray-500">
              <div>{{ formatDate(sharedContent?.createdAt) }}</div>
              <div v-if="sharedContent?.expiresAt" class="text-xs">
                Expires: {{ formatDate(sharedContent.expiresAt) }}
              </div>
            </div>
            <button
              @click="copyShareLink"
              class="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>Copy Link</span>
            </button>
          </div>
        </div>
        
        <!-- Stats -->
        <div v-if="sharedContent" class="mt-4 flex items-center space-x-6 text-sm text-gray-500">
          <span>{{ displayChapters.length }} chapter{{ displayChapters.length !== 1 ? 's' : '' }}</span>
          <span>{{ getUniqueSeriesCount() }} series</span>
          <span>{{ getTranslationStats().translatedParagraphs }}/{{ getTranslationStats().totalParagraphs }} paragraphs translated</span>
          <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            {{ getTranslationStats().progress }}% Complete
          </span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && (!sharedContent?.isPasswordProtected || isPasswordVerified)" class="max-w-4xl mx-auto px-4 py-12 text-center">
      <div class="text-6xl mb-4">⏳</div>
      <h2 class="text-xl font-medium text-gray-900 mb-2">Loading shared content...</h2>
      <p class="text-gray-500">Please wait while we fetch the translation.</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && (!sharedContent?.isPasswordProtected || isPasswordVerified)" class="max-w-4xl mx-auto px-4 py-12 text-center">
      <div class="text-6xl mb-4">❌</div>
      <h2 class="text-xl font-medium text-gray-900 mb-2">Content Not Found</h2>
      <p class="text-gray-500 mb-4">{{ error }}</p>
      <router-link 
        to="/" 
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Translation Tool
      </router-link>
    </div>

    <!-- Content -->
    <div v-else-if="sharedContent && (!sharedContent.isPasswordProtected || isPasswordVerified)" class="max-w-4xl mx-auto px-4 py-8">
      <!-- View Mode Toggle -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="viewMode = 'translation'"
            :class="viewMode === 'translation' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
            class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Translation Only
          </button>
          <button
            @click="viewMode = 'split'"
            :class="viewMode === 'split' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
            class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Split View
          </button>
          <button
            @click="viewMode = 'original'"
            :class="viewMode === 'original' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'"
            class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Original Only
          </button>
        </div>
        
        <div class="text-sm text-gray-500">
          Read-only view
        </div>
      </div>

      <!-- Chapters -->
      <div class="space-y-8">
        <div
          v-for="(chapter, index) in displayChapters"
          :key="chapter.id"
          class="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <!-- Chapter Header -->
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ chapter.title }}</h2>
                <p class="text-sm text-gray-500 mt-1">
                  From: {{ chapter.seriesName }} • Chapter {{ index + 1 }} of {{ displayChapters.length }}
                </p>
              </div>
              <div class="text-sm text-gray-500">
                {{ getChapterStats(chapter).progress }}% translated
              </div>
            </div>
          </div>

          <!-- Chapter Content -->
          <div class="p-6">
            <!-- Split View -->
            <div v-if="viewMode === 'split'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-3">Original Text</h3>
                <div class="prose prose-sm max-w-none">
                  <div v-html="formatTextForDisplay(chapter.originalText)"></div>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-3">Translation</h3>
                <div class="prose prose-sm max-w-none">
                  <div v-if="chapter.translatedText.trim()" v-html="formatTextForDisplay(chapter.translatedText)"></div>
                  <div v-else class="text-gray-400 italic">No translation available</div>
                </div>
              </div>
            </div>

            <!-- Translation Only -->
            <div v-else-if="viewMode === 'translation'">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Translation</h3>
              <div class="prose max-w-none">
                <div v-if="chapter.translatedText.trim()" v-html="formatTextForDisplay(chapter.translatedText)"></div>
                <div v-else class="text-gray-400 italic">No translation available</div>
              </div>
            </div>

            <!-- Original Only -->
            <div v-else-if="viewMode === 'original'">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Original Text</h3>
              <div class="prose max-w-none">
                <div v-html="formatTextForDisplay(chapter.originalText)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-center py-8 border-t border-gray-200">
        <!-- Translation Tool Badge -->
        <div class="fixed bottom-4 left-4 z-50">
          <a 
            href="/" 
            class="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all text-xs font-medium hover:shadow-xl transform hover:scale-105"
            title="Translated with AI-Assisted Novel Translation Tool"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Translated with AI Tool</span>
          </a>
        </div>
        
        <p class="text-gray-500 text-sm">
          Shared via AI-Assisted Novel Translation Tool
        </p>
        <router-link 
          to="/" 
          class="inline-flex items-center mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Create your own translations →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSharingStore } from '../store';
import { sharingAPI } from '../api';
import type { SharedContent } from '../types';
import type { Chapter, Series } from '@/types';

interface Props {
  chapters: Chapter[];
  series: Series[];
}

const props = defineProps<Props>();

interface DisplayChapter {
  id: string;
  title: string;
  originalText: string;
  translatedText: string;
  seriesName: string;
  seriesId: string;
}

const route = useRoute();
const sharingStore = useSharingStore();

const isLoading = ref(false);
const error = ref<string | null>(null);

const sharedContent = ref<SharedContent | null>(null);
const displayChapters = ref<DisplayChapter[]>([]);
const viewMode = ref<'split' | 'translation' | 'original'>('translation');
const isPasswordVerified = ref(false);
const passwordInput = ref('');
const passwordError = ref('');
const isVerifyingPassword = ref(false);

const shareId = computed(() => route.params.shareId as string);

onMounted(async () => {
  if (shareId.value) {
    isLoading.value = true;
    const response = await sharingAPI.getSharedContent(shareId.value);

    if (response.success && response.data) {
      sharedContent.value = response.data;
      sharingStore.setActiveShare(response.data);
      if (!response.data.isPasswordProtected) {
        isPasswordVerified.value = true;
      }

      // Load chapter data based on IDs
      loadChapterData(response.data);
    } else {
      error.value = response.error || 'Failed to load shared content';
    }

    isLoading.value = false;
  }
});

const loadChapterData = (content: SharedContent) => {
  const allChapters = props.chapters;
  const seriesMap = props.series;

  // Get chapters from chapterIds
  const chaptersFromIds = content.chapterIds
    .map(id => allChapters.find(ch => ch.id === id))
    .filter((ch): ch is Chapter => ch !== undefined);

  // Get chapters from seriesIds
  const chaptersFromSeries = content.seriesIds
    .flatMap(seriesId => {
      const s = seriesMap.find(sr => sr.id === seriesId);
      return s ? s.chapters : [];
    });

  // Combine and convert to display format
  const allSelectedChapters = [...chaptersFromIds, ...chaptersFromSeries];
  displayChapters.value = allSelectedChapters.map(ch => {
    const seriesInfo = seriesMap.find(s => s.id === ch.seriesId);
    return {
      id: ch.id,
      title: ch.title,
      originalText: ch.originalParagraphs.join('\n'),
      translatedText: ch.translatedParagraphs.join('\n'),
      seriesName: seriesInfo?.name || 'Unknown Series',
      seriesId: ch.seriesId
    };
  });
};

const verifyPassword = async () => {
  if (!passwordInput.value.trim()) return;
  
  isVerifyingPassword.value = true;
  passwordError.value = '';
  
  try {
    // In a real implementation, you would verify the password with the backend
    // For now, we'll simulate password verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, we'll check against a stored password in localStorage
    // In production, this would be handled securely on the backend
    const storedShare = localStorage.getItem(`share-${shareId.value}`);
    if (storedShare) {
      const shareData = JSON.parse(storedShare);
      if (shareData.isPasswordProtected) {
        // For demo, we'll assume password is stored (in real app, this would be hashed)
        if (shareData.password === passwordInput.value) {
          isPasswordVerified.value = true;
          passwordError.value = '';
        } else {
          passwordError.value = 'Incorrect password. Please try again.';
        }
      } else {
        // Not password protected, allow access
        isPasswordVerified.value = true;
      }
    } else {
      passwordError.value = 'Share not found or has expired.';
    }
  } catch (error) {
    passwordError.value = 'Failed to verify password. Please try again.';
  } finally {
    isVerifyingPassword.value = false;
  }
};

const formatDate = (date?: Date): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTextForDisplay = (text: string): string => {
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<p>${line.trim()}</p><br>`)
    .join('');
};

const getUniqueSeriesCount = (): number => {
  if (!sharedContent.value) return 0;
  const seriesIds = new Set([
    ...sharedContent.value.seriesIds,
    ...displayChapters.value.map(c => c.seriesId)
  ]);
  return seriesIds.size;
};

const getTranslationStats = () => {
  if (displayChapters.value.length === 0) return { totalParagraphs: 0, translatedParagraphs: 0, progress: 0 };

  let totalParagraphs = 0;
  let translatedParagraphs = 0;

  displayChapters.value.forEach(chapter => {
    const originalParagraphs = chapter.originalText.split('\n').filter(p => p.trim()).length;
    const translatedParagraphsCount = chapter.translatedText.split('\n').filter(p => p.trim()).length;

    totalParagraphs += originalParagraphs;
    translatedParagraphs += Math.min(translatedParagraphsCount, originalParagraphs);
  });

  const progress = totalParagraphs > 0 ? Math.round((translatedParagraphs / totalParagraphs) * 100) : 0;

  return { totalParagraphs, translatedParagraphs, progress };
};

const getChapterStats = (chapter: DisplayChapter) => {
  const originalParagraphs = chapter.originalText.split('\n').filter(p => p.trim()).length;
  const translatedParagraphs = chapter.translatedText.split('\n').filter(p => p.trim()).length;
  const progress = originalParagraphs > 0 ? Math.round((Math.min(translatedParagraphs, originalParagraphs) / originalParagraphs) * 100) : 0;
  
  return { originalParagraphs, translatedParagraphs, progress };
};

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
    console.log('Share link copied to clipboard');
  } catch (err) {
    console.error('Failed to copy link:', err);
  }
};
</script>