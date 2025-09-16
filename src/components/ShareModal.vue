<!-- Enhanced ShareModal with Management Features -->
<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Share Your Translations</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200">
        <button
          @click="activeTab = 'create'"
          :class="activeTab === 'create' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
          class="px-6 py-3 border-b-2 font-medium text-sm transition-colors"
        >
          Create Share
        </button>
        <button
          @click="activeTab = 'manage'"
          :class="activeTab === 'manage' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
          class="px-6 py-3 border-b-2 font-medium text-sm transition-colors"
        >
          Manage Shares ({{ existingShares.length }})
        </button>
      </div>

      <!-- Tab Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Create Share Tab -->
        <div v-if="activeTab === 'create'" class="p-6 space-y-6">
          <!-- Share Type Selection -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">What would you like to share?</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  v-model="shareType"
                  type="radio"
                  value="chapter"
                  class="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-900">Single Chapter</div>
                  <div class="text-sm text-gray-500">Share one specific chapter</div>
                </div>
              </label>

              <label class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  v-model="shareType"
                  type="radio"
                  value="chapters"
                  class="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-900">Multiple Chapters</div>
                  <div class="text-sm text-gray-500">Select specific chapters to share</div>
                </div>
              </label>

              <label class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  v-model="shareType"
                  type="radio"
                  value="series"
                  class="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-900">Complete Series</div>
                  <div class="text-sm text-gray-500">Share all chapters from one series</div>
                </div>
              </label>

              <label class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  v-model="shareType"
                  type="radio"
                  value="multiple-series"
                  class="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-900">Multiple Series</div>
                  <div class="text-sm text-gray-500">Share multiple complete series</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Content Selection -->
          <div v-if="shareType" class="space-y-4">
            <!-- Single Chapter Selection -->
            <div v-if="shareType === 'chapter'">
              <h4 class="font-medium text-gray-900 mb-3">Select Chapter</h4>
              <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <div v-for="seriesItem in series" :key="seriesItem.id" class="border-b border-gray-100 last:border-b-0">
                  <div class="p-3 bg-gray-50 font-medium text-gray-900 text-sm">{{ seriesItem.name }}</div>
                  <div class="divide-y divide-gray-100">
                    <label
                      v-for="chapter in getTranslatedChapters(seriesItem.chapters)"
                      :key="chapter.id"
                      class="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        v-model="selectedChapterId"
                        type="radio"
                        :value="chapter.id"
                        class="text-blue-600 focus:ring-blue-500"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-gray-900 truncate">{{ chapter.title }}</div>
                        <div class="text-xs text-gray-500">{{ getTranslationProgress(chapter) }}% translated • {{ chapter.originalParagraphs.length }} paragraphs</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Multiple Chapters Selection with Virtual Scrolling -->
            <div v-if="shareType === 'chapters'">
              <h4 class="font-medium text-gray-900 mb-3">Select Chapters</h4>
              <div class="mb-3 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <button
                    @click="selectAllChapters"
                    class="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Select All
                  </button>
                  <span class="text-gray-300">|</span>
                  <button
                    @click="clearAllChapters"
                    class="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                </div>
                <div class="text-sm text-gray-500">{{ selectedChapterIds.length }} selected</div>
              </div>
              
              <!-- Search/Filter -->
              <div class="mb-3">
                <input
                  v-model="chapterSearchQuery"
                  type="text"
                  placeholder="Search chapters..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div class="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                <div v-for="seriesItem in filteredSeries" :key="seriesItem.id" class="border-b border-gray-100 last:border-b-0">
                  <div class="p-3 bg-gray-50 font-medium text-gray-900 text-sm flex items-center justify-between">
                    <span>{{ seriesItem.name }}</span>
                    <div class="flex items-center space-x-2">
                      <button
                        @click="toggleSeriesSelection(seriesItem.id)"
                        class="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {{ isSeriesFullySelected(seriesItem.id) ? 'Deselect All' : 'Select All' }}
                      </button>
                      <span class="text-xs text-gray-500">
                        {{ getSelectedChaptersInSeries(seriesItem.id) }}/{{ getTranslatedChapters(seriesItem.chapters).length }}
                      </span>
                    </div>
                  </div>
                  <div class="divide-y divide-gray-100">
                    <label
                      v-for="chapter in getFilteredChapters(seriesItem.chapters)"
                      :key="chapter.id"
                      class="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        v-model="selectedChapterIds"
                        type="checkbox"
                        :value="chapter.id"
                        class="text-blue-600 focus:ring-blue-500"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-gray-900 truncate">{{ chapter.title }}</div>
                        <div class="text-xs text-gray-500">{{ getTranslationProgress(chapter) }}% translated • {{ chapter.originalParagraphs.length }} paragraphs</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Series Selection -->
            <div v-if="shareType === 'series'">
              <h4 class="font-medium text-gray-900 mb-3">Select Series</h4>
              <div class="space-y-2">
                <label
                  v-for="seriesItem in getSeriesWithTranslations()"
                  :key="seriesItem.id"
                  class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    v-model="selectedSeriesId"
                    type="radio"
                    :value="seriesItem.id"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">{{ seriesItem.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{ getSeriesTranslationProgress(seriesItem) }}% translated • {{ seriesItem.chapters.length }} chapters • {{ getSeriesWordCount(seriesItem) }} words
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Multiple Series Selection -->
            <div v-if="shareType === 'multiple-series'">
              <h4 class="font-medium text-gray-900 mb-3">Select Series</h4>
              <div class="mb-3 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <button
                    @click="selectAllSeries"
                    class="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Select All
                  </button>
                  <span class="text-gray-300">|</span>
                  <button
                    @click="clearAllSeries"
                    class="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                </div>
                <div class="text-sm text-gray-500">{{ selectedSeriesIds.length }} selected</div>
              </div>
              
              <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                <label
                  v-for="seriesItem in getSeriesWithTranslations()"
                  :key="seriesItem.id"
                  class="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    v-model="selectedSeriesIds"
                    type="checkbox"
                    :value="seriesItem.id"
                    class="text-blue-600 focus:ring-blue-500"
                  />
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">{{ seriesItem.name }}</div>
                    <div class="text-xs text-gray-500">
                      {{ getSeriesTranslationProgress(seriesItem) }}% translated • {{ seriesItem.chapters.length }} chapters • {{ getSeriesWordCount(seriesItem) }} words
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Share Details -->
          <div v-if="shareType && hasValidSelection" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Share Title</label>
                <input
                  v-model="shareTitle"
                  type="text"
                  :placeholder="getDefaultTitle()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Expiration</label>
                <select
                  v-model="shareExpiration"
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
                v-model="shareDescription"
                rows="3"
                placeholder="Add a description for your shared content..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            <!-- Password Protection -->
            <div class="flex items-center space-x-3">
              <input
                v-model="sharePasswordProtected"
                type="checkbox"
                id="password-protect"
                class="text-blue-600 focus:ring-blue-500"
              />
              <label for="password-protect" class="text-sm font-medium text-gray-700">Password protect this share</label>
            </div>
            
            <div v-if="sharePasswordProtected">
              <input
                v-model="sharePassword"
                type="password"
                placeholder="Enter password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Share Preview -->
          <div v-if="shareType && hasValidSelection" class="p-4 bg-blue-50 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">Share Preview</h4>
            <div class="text-sm text-gray-600 space-y-1">
              <p><strong>Type:</strong> {{ getShareTypeLabel() }}</p>
              <p><strong>Content:</strong> {{ getContentSummary() }}</p>
              <p v-if="shareStats"><strong>Progress:</strong> {{ shareStats.translatedParagraphs }}/{{ shareStats.totalParagraphs }} paragraphs translated ({{ shareStats.translationProgress }}%)</p>
              <p><strong>Expires:</strong> {{ shareExpiration === '0' ? 'Never' : `${shareExpiration} days` }}</p>
              <p v-if="sharePasswordProtected"><strong>Password:</strong> Protected</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              @click="$emit('close')"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleShare"
              :disabled="!hasValidSelection || isCreatingShare"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ isCreatingShare ? 'Creating...' : 'Create Share Link' }}
            </button>
          </div>
        </div>

        <!-- Manage Shares Tab -->
        <div v-else-if="activeTab === 'manage'" class="p-6">
          <div v-if="existingShares.length === 0" class="text-center py-12">
            <div class="text-4xl mb-4">📤</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No shares created yet</h3>
            <p class="text-gray-500">Create your first share to see it here</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="share in existingShares"
              :key="share.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate">{{ share.title }}</h4>
                  <p v-if="share.description" class="text-xs text-gray-500 mt-1">{{ share.description }}</p>
                  <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{{ share.content.length }} chapters</span>
                    <span>Created {{ formatDate(share.createdAt) }}</span>
                    <span v-if="share.expiresAt" :class="isExpired(share.expiresAt) ? 'text-red-500' : 'text-gray-500'">
                      {{ isExpired(share.expiresAt) ? 'Expired' : `Expires ${formatDate(share.expiresAt)}` }}
                    </span>
                    <span v-else class="text-green-600">Never expires</span>
                    <span v-if="share.isPasswordProtected" class="text-blue-600">🔒 Protected</span>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2 ml-4">
                  <button
                    @click="copyShareLink(share.id)"
                    class="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Copy link"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    @click="openShareSettings(share)"
                    class="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Settings"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteShare(share.id)"
                    class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Share Settings Modal -->
  <div v-if="showShareSettings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60" @click="closeShareSettings">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Share Settings</h3>
        <button @click="closeShareSettings" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="selectedShare" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            v-model="selectedShare.title"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Extend Expiration</label>
          <select
            v-model="extendDuration"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Extend by 7 days</option>
            <option value="30">Extend by 30 days</option>
            <option value="90">Extend by 90 days</option>
            <option value="0">Never expires</option>
          </select>
        </div>

        <div class="flex items-center space-x-3">
          <input
            v-model="selectedShare.isPasswordProtected"
            type="checkbox"
            id="edit-password-protect"
            class="text-blue-600 focus:ring-blue-500"
          />
          <label for="edit-password-protect" class="text-sm font-medium text-gray-700">Password protect</label>
        </div>

        <div v-if="selectedShare.isPasswordProtected">
          <input
            v-model="editPassword"
            type="password"
            placeholder="Enter new password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            @click="closeShareSettings"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="updateShareSettings"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useChapters } from '../composables/useChapters';
import { useSharing } from '../composables/useSharing';
import type { ShareRequest, SharedContent } from '../types/sharing';
import type { Chapter, Series } from '../types';

const emit = defineEmits<{
  close: [];
  share: [request: ShareRequest];
}>();

const { series } = useChapters();
const { createShare } = useSharing();

// Tab management
const activeTab = ref<'create' | 'manage'>('create');

// Create share form state
const shareType = ref<'chapter' | 'chapters' | 'series' | 'multiple-series'>('chapter');
const selectedChapterId = ref('');
const selectedChapterIds = ref<string[]>([]);
const selectedSeriesId = ref('');
const selectedSeriesIds = ref<string[]>([]);
const shareTitle = ref('');
const shareDescription = ref('');
const shareExpiration = ref('30');
const sharePasswordProtected = ref(false);
const sharePassword = ref('');
const isCreatingShare = ref(false);

// Search and filtering
const chapterSearchQuery = ref('');

// Manage shares state
const existingShares = ref<SharedContent[]>([]);
const showShareSettings = ref(false);
const selectedShare = ref<SharedContent | null>(null);
const extendDuration = ref('30');
const editPassword = ref('');

// Load existing shares
onMounted(() => {
  loadExistingShares();
});

const loadExistingShares = () => {
  // In a real app, this would fetch from API
  // For now, load from localStorage
  const shares: SharedContent[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('share-')) {
      try {
        const shareData = JSON.parse(localStorage.getItem(key) || '');
        shares.push(shareData);
      } catch (e) {
        // Invalid share data, skip
      }
    }
  }
  existingShares.value = shares.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Computed properties
const hasValidSelection = computed(() => {
  switch (shareType.value) {
    case 'chapter':
      return !!selectedChapterId.value;
    case 'chapters':
      return selectedChapterIds.value.length > 0;
    case 'series':
      return !!selectedSeriesId.value;
    case 'multiple-series':
      return selectedSeriesIds.value.length > 0;
    default:
      return false;
  }
});

const filteredSeries = computed(() => {
  if (!chapterSearchQuery.value) return series.value;
  
  return series.value.map(s => ({
    ...s,
    chapters: s.chapters.filter(c => 
      c.title.toLowerCase().includes(chapterSearchQuery.value.toLowerCase())
    )
  })).filter(s => s.chapters.length > 0);
});

const shareStats = computed(() => {
  if (!hasValidSelection.value) return null;

  let chapters: Chapter[] = [];
  let seriesCount = 0;

  switch (shareType.value) {
    case 'chapter':
      const chapter = getAllChapters().find(c => c.id === selectedChapterId.value);
      if (chapter) chapters = [chapter];
      seriesCount = 1;
      break;
    case 'chapters':
      chapters = getAllChapters().filter(c => selectedChapterIds.value.includes(c.id));
      seriesCount = new Set(chapters.map(c => c.seriesId)).size;
      break;
    case 'series':
      const selectedSeries = series.value.find(s => s.id === selectedSeriesId.value);
      if (selectedSeries) {
        chapters = selectedSeries.chapters;
        seriesCount = 1;
      }
      break;
    case 'multiple-series':
      chapters = series.value
        .filter(s => selectedSeriesIds.value.includes(s.id))
        .flatMap(s => s.chapters);
      seriesCount = selectedSeriesIds.value.length;
      break;
  }

  const totalParagraphs = chapters.reduce((sum, c) => sum + c.originalParagraphs.length, 0);
  const translatedParagraphs = chapters.reduce(
    (sum, c) => sum + c.translatedParagraphs.filter(p => p.trim()).length,
    0
  );

  return {
    totalChapters: chapters.length,
    totalSeries: seriesCount,
    totalParagraphs,
    translatedParagraphs,
    translationProgress: totalParagraphs > 0 ? Math.round((translatedParagraphs / totalParagraphs) * 100) : 0
  };
});

// Helper functions
const getAllChapters = () => {
  return series.value.flatMap(s => s.chapters);
};

const getTranslatedChapters = (chapters: Chapter[]) => {
  return chapters.filter(chapter => 
    chapter.originalParagraphs.some(p => p.trim())
  );
};

const getFilteredChapters = (chapters: Chapter[]) => {
  const translated = getTranslatedChapters(chapters);
  if (!chapterSearchQuery.value) return translated;
  
  return translated.filter(c => 
    c.title.toLowerCase().includes(chapterSearchQuery.value.toLowerCase())
  );
};

const getSeriesWithTranslations = () => {
  return series.value.filter(s => 
    s.chapters.some(chapter => 
      chapter.originalParagraphs.some(p => p.trim())
    )
  );
};

const getTranslationProgress = (chapter: Chapter): number => {
  if (chapter.translatedParagraphs.length === 0) return 0;
  const translatedCount = chapter.translatedParagraphs.filter(p => p.trim()).length;
  return Math.round((translatedCount / chapter.originalParagraphs.length) * 100);
};

const getSeriesTranslationProgress = (series: Series): number => {
  const totalParagraphs = series.chapters.reduce((sum, c) => sum + c.originalParagraphs.length, 0);
  const translatedParagraphs = series.chapters.reduce(
    (sum, c) => sum + c.translatedParagraphs.filter(p => p.trim()).length,
    0
  );
  if (totalParagraphs === 0) return 0;
  return Math.round((translatedParagraphs / totalParagraphs) * 100);
};

const getSeriesWordCount = (series: Series): number => {
  return series.chapters.reduce((sum, c) => 
    sum + c.originalParagraphs.reduce((pSum, p) =>
      pSum + (p.translatedText || p.originalText).split(' ').length, 0
    ), 0
  );
};

const getDefaultTitle = (): string => {
  switch (shareType.value) {
    case 'chapter':
      const chapter = getAllChapters().find(c => c.id === selectedChapterId.value);
      return chapter ? `${chapter.title} - Translation` : 'Chapter Translation';
    case 'chapters':
      return `${selectedChapterIds.value.length} Chapters - Translation`;
    case 'series':
      const selectedSeries = series.value.find(s => s.id === selectedSeriesId.value);
      return selectedSeries ? `${selectedSeries.name} - Complete Translation` : 'Series Translation';
    case 'multiple-series':
      return `${selectedSeriesIds.value.length} Series - Translation Collection`;
    default:
      return 'Translation Share';
  }
};

const getShareTypeLabel = (): string => {
  const labels = {
    chapter: 'Single Chapter',
    chapters: 'Multiple Chapters',
    series: 'Complete Series',
    'multiple-series': 'Multiple Series'
  };
  return labels[shareType.value];
};

const getContentSummary = (): string => {
  if (!shareStats.value) return '';
  
  const { totalChapters, totalSeries, translationProgress } = shareStats.value;
  
  if (totalSeries === 1) {
    return `${totalChapters} chapter${totalChapters !== 1 ? 's' : ''} (${translationProgress}% translated)`;
  } else {
    return `${totalChapters} chapters across ${totalSeries} series (${translationProgress}% translated)`;
  }
};

// Selection helpers
const selectAllChapters = () => {
  selectedChapterIds.value = getAllChapters()
    .filter(c => c.translatedParagraphs.some(p => p.trim()))
    .map(c => c.id);
};

const clearAllChapters = () => {
  selectedChapterIds.value = [];
};

const selectAllSeries = () => {
  selectedSeriesIds.value = getSeriesWithTranslations().map(s => s.id);
};

const clearAllSeries = () => {
  selectedSeriesIds.value = [];
};

const toggleSeriesSelection = (seriesId: string) => {
  const seriesChapters = getTranslatedChapters(
    series.value.find(s => s.id === seriesId)?.chapters || []
  );
  const seriesChapterIds = seriesChapters.map(c => c.id);
  
  const allSelected = seriesChapterIds.every(id => selectedChapterIds.value.includes(id));
  
  if (allSelected) {
    selectedChapterIds.value = selectedChapterIds.value.filter(id => !seriesChapterIds.includes(id));
  } else {
    const newIds = seriesChapterIds.filter(id => !selectedChapterIds.value.includes(id));
    selectedChapterIds.value.push(...newIds);
  }
};

const isSeriesFullySelected = (seriesId: string): boolean => {
  const seriesChapters = getTranslatedChapters(
    series.value.find(s => s.id === seriesId)?.chapters || []
  );
  const seriesChapterIds = seriesChapters.map(c => c.id);
  return seriesChapterIds.length > 0 && seriesChapterIds.every(id => selectedChapterIds.value.includes(id));
};

const getSelectedChaptersInSeries = (seriesId: string): number => {
  const seriesChapters = getTranslatedChapters(
    series.value.find(s => s.id === seriesId)?.chapters || []
  );
  const seriesChapterIds = seriesChapters.map(c => c.id);
  return seriesChapterIds.filter(id => selectedChapterIds.value.includes(id)).length;
};

// Share management
const handleShare = async () => {
  if (!hasValidSelection.value) return;

  isCreatingShare.value = true;

  const request: ShareRequest = {
    type: shareType.value,
    title: shareTitle.value || getDefaultTitle(),
    description: shareDescription.value || undefined,
    expirationDays: shareExpiration.value === '0' ? undefined : parseInt(shareExpiration.value),
    password: sharePasswordProtected.value ? sharePassword.value : undefined
  };

  switch (shareType.value) {
    case 'chapter':
      request.chapterIds = [selectedChapterId.value];
      break;
    case 'chapters':
      request.chapterIds = selectedChapterIds.value;
      break;
    case 'series':
      request.seriesIds = [selectedSeriesId.value];
      break;
    case 'multiple-series':
      request.seriesIds = selectedSeriesIds.value;
      break;
  }

  try {
    const result = await createShare(request);
    if (result.success && result.data) {
      await navigator.clipboard.writeText(result.data.shareUrl);
      loadExistingShares(); // Refresh the list
      emit('close');
    }
  } catch (error) {
    console.error('Failed to create share:', error);
  } finally {
    isCreatingShare.value = false;
  }
};

const copyShareLink = async (shareId: string) => {
  const shareUrl = `${window.location.origin}/share/${shareId}`;
  try {
    await navigator.clipboard.writeText(shareUrl);
    // Could add toast notification here
  } catch (err) {
    console.error('Failed to copy link:', err);
  }
};

const openShareSettings = (share: SharedContent) => {
  selectedShare.value = { ...share };
  editPassword.value = '';
  showShareSettings.value = true;
};

const closeShareSettings = () => {
  showShareSettings.value = false;
  selectedShare.value = null;
};

const updateShareSettings = () => {
  if (!selectedShare.value) return;
  
  // Update the share in localStorage (in real app, this would be API call)
  const shareKey = `share-${selectedShare.value.id}`;
  
  if (extendDuration.value !== '0') {
    const currentExpiry = selectedShare.value.expiresAt ? new Date(selectedShare.value.expiresAt) : new Date();
    const newExpiry = new Date(currentExpiry.getTime() + parseInt(extendDuration.value) * 24 * 60 * 60 * 1000);
    selectedShare.value.expiresAt = newExpiry;
  } else {
    selectedShare.value.expiresAt = undefined;
  }
  
  localStorage.setItem(shareKey, JSON.stringify(selectedShare.value));
  loadExistingShares();
  closeShareSettings();
};

const deleteShare = (shareId: string) => {
  if (confirm('Are you sure you want to delete this share? This action cannot be undone.')) {
    localStorage.removeItem(`share-${shareId}`);
    loadExistingShares();
  }
};

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const isExpired = (expiresAt: Date | string): boolean => {
  return new Date() > new Date(expiresAt);
};

// Reset selections when share type changes
watch(shareType, () => {
  selectedChapterId.value = '';
  selectedChapterIds.value = [];
  selectedSeriesId.value = '';
  selectedSeriesIds.value = [];
  shareTitle.value = '';
  shareDescription.value = '';
});
</script>