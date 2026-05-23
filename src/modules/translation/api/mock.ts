/**
 * Translation Module - Mock API Implementation
 *
 * Provides mock translation responses for development and testing.
 * Simulates realistic network delays and occasional failures.
 *
 * IMPORTANT: This is feature-specific mock logic that belongs to Translation module,
 * NOT in Core infrastructure.
 */

import type { APIResponse } from '@/modules/core';
import type { StreamJobResponse } from '../types';

const simulateDelay = (min = 300, max = 1000): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const simulateFailure = (failureRate = 0.05): boolean => {
  return Math.random() < failureRate;
};

export class TranslationMockAPI {

  async translateChapterStream(
    chapterId: string,
    mode: string = 'full'
  ): Promise<APIResponse<StreamJobResponse>> {
    await simulateDelay(300, 600);

    if (simulateFailure(0.05)) {
      return {
        success: false,
        error: 'Failed to start streaming translation'
      };
    }

    const jobId = `mock-stream-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const streamUrl = `http://localhost:8765/stream/${jobId}`;

    return {
      success: true,
      data: { jobId, streamUrl, completed: false }
    };
  }

  async suggestGlossaryTerms(text: string): Promise<APIResponse<string[]>> {
    await simulateDelay(400, 800);

    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const frequency: Record<string, number> = {};

    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const suggestions = Object.entries(frequency)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([word, _]) => word);

    return {
      success: true,
      data: suggestions,
    };
  }
}
