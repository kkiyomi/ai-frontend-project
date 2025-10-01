import type { APIResponse } from '../types';

interface CacheEntry<T> {
  data: APIResponse<T>;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  bypassCache?: boolean;
  tags?: string[]; // For cache invalidation by tag
}

/**
 * Core API Client - handles HTTP requests with caching and proper error handling
 * Used by all modules for consistent API communication
 */
export class APIClient {
  private baseURL: string;
  private cache: Map<string, CacheEntry<any>>;
  private tagMap: Map<string, Set<string>>; // Maps tags to cache keys
  private defaultTTL: number;

  constructor(baseURL: string, defaultTTL: number = 5 * 60 * 1000) {
    this.baseURL = baseURL.replace(/\/$/, '');
    this.cache = new Map();
    this.tagMap = new Map();
    this.defaultTTL = defaultTTL; // Default 5 minutes
  }

  /**
   * Generates cache key from endpoint and options
   */
  private getCacheKey(endpoint: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body || '';
    return `${method}:${endpoint}:${body}`;
  }

  /**
   * Checks if cached entry is still valid
   */
  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Gets data from cache if valid
   */
  private getFromCache<T>(key: string): APIResponse<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (this.isCacheValid(entry)) {
      return entry.data;
    }

    // Clean up expired entry
    this.cache.delete(key);
    return null;
  }

  /**
   * Stores data in cache with optional tags
   */
  private setCache<T>(
    key: string,
    data: APIResponse<T>,
    ttl: number,
    tags?: string[]
  ): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Associate cache key with tags
    if (tags) {
      tags.forEach(tag => {
        if (!this.tagMap.has(tag)) {
          this.tagMap.set(tag, new Set());
        }
        this.tagMap.get(tag)!.add(key);
      });
    }
  }

  /**
   * Invalidates cache entries by tag
   */
  public invalidateByTag(tag: string): void {
    const keys = this.tagMap.get(tag);
    if (keys) {
      keys.forEach(key => this.cache.delete(key));
      this.tagMap.delete(tag);
    }
  }

  /**
   * Invalidates specific cache entry
   */
  public invalidate(endpoint: string, method: string = 'GET'): void {
    const key = this.getCacheKey(endpoint, { method });
    this.cache.delete(key);
  }

  /**
   * Clears entire cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.tagMap.clear();
  }

  /**
   * Gets cache statistics
   */
  public getCacheStats(): { size: number; entries: number } {
    let size = 0;
    this.cache.forEach(entry => {
      size += JSON.stringify(entry.data).length;
    });
    return {
      size,
      entries: this.cache.size,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheOptions?: CacheOptions
  ): Promise<APIResponse<T>> {
    const cacheKey = this.getCacheKey(endpoint, options);
    const method = options.method || 'GET';
    const shouldCache = method === 'GET' && !cacheOptions?.bypassCache;

    // Check cache for GET requests
    if (shouldCache) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies for session
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const result: APIResponse<T> = {
        success: true,
        data,
      };

      // Cache successful GET requests
      if (shouldCache) {
        const ttl = cacheOptions?.ttl || this.defaultTTL;
        this.setCache(cacheKey, result, ttl, cacheOptions?.tags);
      }

      return result;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async get<T>(endpoint: string, cacheOptions?: CacheOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, cacheOptions);
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });

    // Invalidate related GET caches on mutation
    this.invalidate(endpoint);
    return result;
  }

  async patch<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    const result = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });

    // Invalidate related GET caches on mutation
    this.invalidate(endpoint);
    return result;
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    const result = await this.request<T>(endpoint, { method: 'DELETE' });

    // Invalidate related GET caches on mutation
    this.invalidate(endpoint);
    return result;
  }
}