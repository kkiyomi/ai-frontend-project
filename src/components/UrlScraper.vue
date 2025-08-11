<template>
  <div class="p-4 border-b border-gray-200 bg-blue-50">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900">Web Scraper</h3>
      <button
        @click="toggleScraper"
        class="text-xs text-blue-600 hover:text-blue-700 transition-colors"
      >
        {{ showScraper ? 'Hide' : 'Show' }}
      </button>
    </div>
    
    <div v-if="showScraper" class="space-y-3">
      <div class="relative">
        <input
          v-model="url"
          type="url"
          placeholder="https://example.com/novel-chapter"
          class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          :disabled="isLoading"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
        </div>
      </div>
      
      <!-- Selector Options -->
      <div class="space-y-2">
        <label class="text-xs font-medium text-gray-700">Content Selector (optional)</label>
        <select
          v-model="selectedSelector"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          :disabled="isLoading"
        >
          <option value="">Auto-detect content</option>
          <option value="article">Article tag</option>
          <option value="main">Main content</option>
          <option value=".content">.content class</option>
          <option value="#content">#content id</option>
          <option value="p">All paragraphs</option>
          <option value="custom">Custom selector...</option>
        </select>
        
        <input
          v-if="selectedSelector === 'custom'"
          v-model="customSelector"
          type="text"
          placeholder="Enter CSS selector (e.g., .chapter-content p)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          :disabled="isLoading"
        />
      </div>
      
      <button
        @click="scrapeContent"
        :disabled="!url.trim() || isLoading"
        class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span>{{ isLoading ? 'Scraping...' : 'Scrape Content' }}</span>
      </button>
      
      <!-- Status Messages -->
      <div v-if="statusMessage" class="text-xs p-2 rounded" :class="statusType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
        {{ statusMessage }}
      </div>
      
      <!-- Preview -->
      <div v-if="scrapedPreview" class="mt-3">
        <div class="text-xs font-medium text-gray-700 mb-2">Preview (first 200 chars):</div>
        <div class="text-xs text-gray-600 bg-gray-100 p-2 rounded border max-h-20 overflow-y-auto">
          {{ scrapedPreview }}...
        </div>
        <button
          @click="createChapterFromScraped"
          class="mt-2 w-full px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
        >
          Create Chapter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChapters } from '../composables/useChapters';

const { addChapterFromText } = useChapters();

const showScraper = ref(false);
const url = ref('');
const selectedSelector = ref('');
const customSelector = ref('');
const isLoading = ref(false);
const statusMessage = ref('');
const statusType = ref<'success' | 'error'>('success');
const scrapedContent = ref('');
const scrapedPreview = ref('');

const toggleScraper = () => {
  showScraper.value = !showScraper.value;
};

const scrapeContent = async () => {
  if (!url.value.trim()) return;
  
  isLoading.value = true;
  statusMessage.value = '';
  scrapedContent.value = '';
  scrapedPreview.value = '';
  
  try {
    // In a real application, you would need a backend service or CORS proxy
    // For now, we'll simulate the scraping process
    await simulateScraping();
    
  } catch (error) {
    statusMessage.value = 'Failed to scrape content. Please check the URL and try again.';
    statusType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

const simulateScraping = async (): Promise<void> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock scraped content based on URL
  const mockContent = `Chapter 1: The Beginning

This is a simulated scraped content from ${url.value}. In a real implementation, this would be the actual content extracted from the webpage using the selected CSS selector.

The content would be parsed and cleaned to extract readable text, removing navigation elements, ads, and other non-content elements.

This paragraph demonstrates how the scraper would extract multiple paragraphs from a web page and format them properly for translation.

Each paragraph would be separated and ready for the translation process.`;

  scrapedContent.value = mockContent;
  scrapedPreview.value = mockContent.substring(0, 200);
  statusMessage.value = `Successfully scraped ${mockContent.split('\n\n').length} paragraphs`;
  statusType.value = 'success';
};

const createChapterFromScraped = async () => {
  if (!scrapedContent.value) return;
  
  try {
    const chapterTitle = extractTitleFromUrl(url.value);
    await addChapterFromText(scrapedContent.value, chapterTitle);
    
    // Reset form
    url.value = '';
    scrapedContent.value = '';
    scrapedPreview.value = '';
    statusMessage.value = 'Chapter created successfully!';
    statusType.value = 'success';
    
    // Hide scraper after successful creation
    setTimeout(() => {
      showScraper.value = false;
      statusMessage.value = '';
    }, 2000);
    
  } catch (error) {
    statusMessage.value = 'Failed to create chapter from scraped content.';
    statusType.value = 'error';
  }
};

const extractTitleFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/').filter(segment => segment.length > 0);
    const lastSegment = segments[segments.length - 1] || 'Scraped Chapter';
    
    // Clean up the title
    return lastSegment
      .replace(/[-_]/g, ' ')
      .replace(/\.(html|htm|php)$/i, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch {
    return 'Scraped Chapter';
  }
};
</script>