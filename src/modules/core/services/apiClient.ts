import type { APIResponse } from '../types';
import { useErrorStore } from '../errorStore';

interface APIClientConfig {
  /** Enable automatic error modal display for non-200 responses */
  errorModalEnabled?: boolean;
  /** Custom error handler, receives error message and optional details */
  onError?: (message: string, details?: string) => void;
}

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

interface ErrorOptions {
  /** Show error modal for this specific request on non-200 response */
  showModal?: boolean;
  /** Custom error message to display in modal */
  customMessage?: string;
  /** Custom error details to display in modal */
  customDetails?: string;
}



  /**
   * Core API Client - handles HTTP requests with caching and proper error handling
   * Used by all modules for consistent API communication
   *
   * Features:
   * - GET caching with TTL and tag-based invalidation
   * - Consistent APIResponse<T> format
   * - Optional error modal display for non-200 responses
   *   - Global: enableErrorModal() for all requests
   *   - Per-request: pass errorOptions to individual methods
   *
   * Example with global error modal:
   * ```typescript
   * import { apiClient } from '@/modules/core';
   * apiClient.enableErrorModal();
   * ```
   *
   * Example with per-request error modal:
   * ```typescript
   * // Show error modal only for this specific request
   * await apiClient.post('/series', data, { showModal: true });
   *
   * // With custom error message
   * await apiClient.post('/series', data, {
   *   showModal: true,
   *   customMessage: 'Failed to create series',
   *   customDetails: 'Please check your input and try again.'
   * });
   * ```
   */
export class APIClient {
  private baseURL: string;
  private cache: Map<string, CacheEntry<any>>;
  private tagMap: Map<string, Set<string>>; // Maps tags to cache keys
  private defaultTTL: number;
  private errorModalEnabled: boolean;
  private onError?: (message: string, details?: string) => void;

  constructor(baseURL: string, defaultTTL: number = 5 * 60 * 1000, config?: APIClientConfig) {
    this.baseURL = baseURL.replace(/\/$/, '');
    this.cache = new Map();
    this.tagMap = new Map();
    this.defaultTTL = defaultTTL; // Default 5 minutes
    this.errorModalEnabled = config?.errorModalEnabled ?? false;
    this.onError = config?.onError;
  }

  /**
   * Enable error modal display for non-200 responses
   */
  public enableErrorModal(handler?: (message: string, details?: string) => void): void {
    this.errorModalEnabled = true;
    if (handler) {
      this.onError = handler;
    }
  }

  private handleError(message: string, details?: string): void {
    if (this.onError) {
      this.onError(message, details);
    } else {
      // Use default error store
      try {
        const errorStore = useErrorStore();
        errorStore.openErrorModal(message, details);
      } catch (err) {
        console.error('Failed to show error modal:', err);
      }
    }
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
    cacheOptions?: CacheOptions,
    errorOptions?: ErrorOptions
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
        const data = await response.json();
        const errorDetail = data.detail || `Endpoint: ${endpoint}`;

        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        const shouldShowModal = errorOptions?.showModal ?? this.errorModalEnabled;
        if (shouldShowModal) {
          const modalMessage = errorOptions?.customMessage || errorMessage;
          const modalDetails = errorOptions?.customDetails || errorDetail;
          this.handleError(modalMessage, modalDetails);
        }
        throw error;
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async get<T>(endpoint: string, cacheOptions?: CacheOptions, errorOptions?: ErrorOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, cacheOptions, errorOptions);
  }

  async post<T>(endpoint: string, data?: any, errorOptions?: ErrorOptions): Promise<APIResponse<T>> {
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, undefined, errorOptions);

    // Invalidate related GET caches on mutation
    this.invalidate(endpoint);
    return result;
  }

  async patch<T>(endpoint: string, data?: any, errorOptions?: ErrorOptions): Promise<APIResponse<T>> {
    const result = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, undefined, errorOptions);

    // Invalidate related GET caches on mutation
    this.invalidate(endpoint);
    return result;
  }

  async delete<T>(endpoint: string, errorOptions?: ErrorOptions): Promise<APIResponse<T>> {
    const result = await this.request<T>(endpoint, { method: 'DELETE' }, undefined, errorOptions);

    // Invalidate related GET caches on mutation
    this.invalidate(endpoint);
    return result;
  }
}