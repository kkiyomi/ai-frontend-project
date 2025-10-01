/**
 * Core Module Types - Infrastructure Only
 *
 * IMPORTANT: Core does NOT define domain types (Series, Chapter, etc.)
 * Each feature module defines its own domain types.
 */

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
