<template>
    <div class="novel-scraper">
      <div class="scraper-form">
        <div class="input-group">
          <input
            v-model="url"
            type="url"
            placeholder="Enter chapter URL..."
            class="url-input"
            :disabled="isLoading"
          />
          <button
            @click="handleScrape"
            :disabled="!isValidUrl(url) || isLoading"
            class="scrape-button"
          >
            {{ isLoading ? 'Scraping...' : 'Scrape Chapter' }}
          </button>
        </div>
        
        <div v-if="statusMessage" class="status-message" :class="statusType">
          {{ statusMessage }}
        </div>
      </div>
  
      <div v-if="hasContent && result" class="scraper-results">
        <div class="chapter-info">
          <h3>{{ result.title }}</h3>
          <p class="meta">
            {{ result.paragraphCount }} paragraphs • {{ result.wordCount }} words
          </p>
        </div>
        
        <div class="content-preview">
          <h4>Preview:</h4>
          <p>{{ result.preview }}</p>
        </div>
        
        <div class="actions">
          <button @click="copyContent" class="action-button">
            Copy Content
          </button>
          <button @click="clearResults" class="action-button">
            Clear
          </button>
        </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNovelScraper } from '../composables/useNovelScraper';

const { 
  isLoading, 
  result, 
  error, 
  hasContent, 
  statusMessage, 
  scrapeWithRetry, 
  clearResults,
  isValidUrl 
} = useNovelScraper();

const url = ref('');

const statusType = computed(() => {
  if (isLoading.value) return 'loading';
  if (error.value) return 'error';
  if (hasContent.value) return 'success';
  return 'default';
});

const handleScrape = async () => {
  if (!url.value || !isValidUrl(url.value)) return;
  
  // Use retry logic for better reliability
  await scrapeWithRetry(
    url.value, 
    {contentSelector: "#form1 > table:nth-child(7) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > div:nth-child(7)"},
    2
  );
};

const copyContent = async () => {
  if (result.value?.content) {
    try {
      await navigator.clipboard.writeText(result.value.content);
      // You could add a toast notification here
      console.log('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  }
};
</script>
  
<style scoped>
.novel-scraper {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.url-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.scrape-button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.scrape-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.status-message {
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.status-message.loading { background: #e3f2fd; color: #1976d2; }
.status-message.success { background: #e8f5e8; color: #2e7d32; }
.status-message.error { background: #ffebee; color: #c62828; }

.scraper-results {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

.chapter-info h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.meta {
  color: #666;
  font-size: 14px;
  margin: 0 0 15px 0;
}

.content-preview {
  margin: 15px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.content-preview h4 {
  margin: 0 0 10px 0;
  color: #555;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.action-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.action-button:hover {
  background: #f8f9fa;
}
</style>