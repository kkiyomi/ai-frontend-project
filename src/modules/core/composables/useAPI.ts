import { ref } from 'vue';
import type { APIResponse } from '../types';
import type { ShareRequest } from '../types/sharing';
import { apiService } from '../services/apiService';
import type { GlossaryTerm } from '../services/mockAPI';

// Cache for API responses to avoid duplicate calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Pending requests to avoid duplicate calls
const pendingRequests = new Map<string, Promise<any>>();

// Helper function to create cache key
function createCacheKey(method: string, ...args: any[]): string {
  return `${method}:${JSON.stringify(args)}`;
}

// Helper function to get cached data
function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

// Helper function to cache data
function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Helper function to handle API calls with caching and deduplication
async function handleAPICall<T>(
  cacheKey: string,
  apiCall: () => Promise<APIResponse<T>>,
  useCache: boolean = true
): Promise<APIResponse<T>> {
  // Check cache first
  if (useCache) {
    const cached = getCachedData<APIResponse<T>>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Check if request is already pending
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  // Make the API call
  const promise = apiCall();
  pendingRequests.set(cacheKey, promise);

  try {
    const result = await promise;
    
    // Cache successful responses
    if (result.success && useCache) {
      setCachedData(cacheKey, result);
    }
    
    return result;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

export function useAPI() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Translation methods
  const translateText = async (text: string, glossaryContext?: string[]): Promise<APIResponse<string>> => {
    const cacheKey = createCacheKey('translateText', text, glossaryContext);
    return handleAPICall(cacheKey, () => apiService.translateText(text, glossaryContext), false); // Don't cache translations
  };

  const translateParagraph = async (
    text: string,
    chapterId: string,
    paragraphIndex: number,
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> => {
    const cacheKey = createCacheKey('translateParagraph', text, chapterId, paragraphIndex, glossaryContext);
    return handleAPICall(cacheKey, () => apiService.translateParagraph(text, chapterId, paragraphIndex, glossaryContext), false);
  };
  const retranslateWithGlossary = async (
    originalText: string,
    currentTranslation: string,
    glossaryTerms: string[]
  ): Promise<APIResponse<string>> => {
    const cacheKey = createCacheKey('retranslateWithGlossary', originalText, currentTranslation, glossaryTerms);
    return handleAPICall(cacheKey, () => apiService.retranslateWithGlossary(originalText, currentTranslation, glossaryTerms), false);
  };

  const suggestGlossaryTerms = async (text: string): Promise<APIResponse<string[]>> => {
    const cacheKey = createCacheKey('suggestGlossaryTerms', text);
    return handleAPICall(cacheKey, () => apiService.suggestGlossaryTerms(text));
  };

  // Glossary methods with caching
  const getGlossaryTerms = async (seriesId?: string, chapterId?: string): Promise<APIResponse<GlossaryTerm[]>> => {
    const cacheKey = createCacheKey('getGlossaryTerms', seriesId, chapterId);
    return handleAPICall(cacheKey, () => apiService.getGlossaryTerms(seriesId, chapterId));
  };

  const createGlossaryTerm = async (term: Omit<GlossaryTerm, 'id' | 'frequency'>) => {
    const result = await apiService.createGlossaryTerm(term);
    
    // Invalidate related cache entries
    if (result.success) {
      const keysToDelete = Array.from(cache.keys()).filter(key => key.startsWith('getGlossaryTerms:'));
      keysToDelete.forEach(key => cache.delete(key));
    }
    
    return result;
  };

  const updateGlossaryTerm = async (termId: string, updates: Partial<GlossaryTerm>) => {
    const result = await apiService.updateGlossaryTerm(termId, updates);
    
    // Invalidate related cache entries
    if (result.success) {
      const keysToDelete = Array.from(cache.keys()).filter(key => key.startsWith('getGlossaryTerms:'));
      keysToDelete.forEach(key => cache.delete(key));
    }
    
    return result;
  };

  const deleteGlossaryTerm = async (termId: string) => {
    const result = await apiService.deleteGlossaryTerm(termId);
    
    // Invalidate related cache entries
    if (result.success) {
      const keysToDelete = Array.from(cache.keys()).filter(key => key.startsWith('getGlossaryTerms:'));
      keysToDelete.forEach(key => cache.delete(key));
    }
    
    return result;
  };

  // Sharing methods
  const createShare = async (request: ShareRequest) => {
    return apiService.createShare(request);
  };

  const getSharedContent = async (shareId: string) => {
    const cacheKey = createCacheKey('getSharedContent', shareId);
    return handleAPICall(cacheKey, () => apiService.getSharedContent(shareId));
  };

  const deleteShare = async (shareId: string) => {
    const result = await apiService.deleteShare(shareId);
    
    // Invalidate cache for this share
    if (result.success) {
      const cacheKey = createCacheKey('getSharedContent', shareId);
      cache.delete(cacheKey);
    }
    
    return result;
  };

  const verifySharePassword = async (shareId: string, password: string) => {
    return apiService.verifySharePassword(shareId, password);
  };

  // Cache management
  const clearCache = () => {
    cache.clear();
    pendingRequests.clear();
  };

  const clearCacheByPattern = (pattern: string) => {
    const keysToDelete = Array.from(cache.keys()).filter(key => key.includes(pattern));
    keysToDelete.forEach(key => cache.delete(key));
  };

  return {
    isLoading,
    error,
    translateText,
    translateParagraph,
    retranslateWithGlossary,
    suggestGlossaryTerms,
    getGlossaryTerms,
    createGlossaryTerm,
    updateGlossaryTerm,
    deleteGlossaryTerm,
    createShare,
    getSharedContent,
    deleteShare,
    verifySharePassword,
    clearCache,
    clearCacheByPattern,
  };
}

// Separate composable for data management with optimized loading
export function useDataAPI() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Series operations with caching
  const getSeries = async () => {
    const cacheKey = createCacheKey('getSeries');
    return handleAPICall(cacheKey, () => apiService.getSeries());
  };

  const createSeries = async (name: string, description?: string) => {
    const result = await apiService.createSeries(name, description);
    
    // Invalidate series cache
    if (result.success) {
      cache.delete(createCacheKey('getSeries'));
    }
    
    return result;
  };

  const updateSeries = async (seriesId: string, updates: any) => {
    const result = await apiService.updateSeries(seriesId, updates);
    
    // Invalidate related cache entries
    if (result.success) {
      cache.delete(createCacheKey('getSeries'));
      const keysToDelete = Array.from(cache.keys()).filter(key => key.includes(seriesId));
      keysToDelete.forEach(key => cache.delete(key));
    }
    
    return result;
  };

  const deleteSeries = async (seriesId: string) => {
    const result = await apiService.deleteSeries(seriesId);
    
    // Invalidate related cache entries
    if (result.success) {
      cache.delete(createCacheKey('getSeries'));
      const keysToDelete = Array.from(cache.keys()).filter(key => key.includes(seriesId));
      keysToDelete.forEach(key => cache.delete(key));
    }
    
    return result;
  };

  // Chapter operations with caching
  const getChapters = async (seriesId?: string) => {
    const cacheKey = createCacheKey('getChapters', seriesId);
    return handleAPICall(cacheKey, () => apiService.getChapters(seriesId));
  };

  const createChapter = async (title: string, content: string, seriesId: string) => {
    const result = await apiService.createChapter(title, content, seriesId);
    
    // Invalidate related cache entries
    if (result.success) {
      cache.delete(createCacheKey('getChapters'));
      cache.delete(createCacheKey('getChapters', seriesId));
      cache.delete(createCacheKey('getSeries'));
    }
    
    return result;
  };

  const updateChapter = async (chapterId: string, updates: any) => {
    const result = await apiService.updateChapter(chapterId, updates);
    
    // Invalidate related cache entries
    if (result.success) {
      const keysToDelete = Array.from(cache.keys()).filter(key => 
        key.startsWith('getChapters:') || key.includes(chapterId)
      );
      keysToDelete.forEach(key => cache.delete(key));
    }
    
    return result;
  };

  const deleteChapter = async (chapterId: string) => {
    const result = await apiService.deleteChapter(chapterId);
    
    // Invalidate related cache entries
    if (result.success) {
      const keysToDelete = Array.from(cache.keys()).filter(key => 
        key.startsWith('getChapters:') || key.includes(chapterId)
      );
      keysToDelete.forEach(key => cache.delete(key));
      cache.delete(createCacheKey('getSeries'));
    }
    
    return result;
  };

  return {
    isLoading,
    error,
    getSeries,
    createSeries,
    updateSeries,
    deleteSeries,
    getChapters,
    createChapter,
    updateChapter,
    deleteChapter,
  };
}