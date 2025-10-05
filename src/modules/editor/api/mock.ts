/**
 * Editor Module - Mock API Implementation
 *
 * Provides in-memory chapter storage for development/demo mode.
 * Simulates network delays and error conditions for realistic testing.
 */

import type { APIResponse } from '@/modules/core';
import type { Chapter } from '../types';
import mockData from '@/mock';

let mockChapters = [...mockData.mockChapters];

// Simulate network delay
const simulateDelay = (min = 300, max = 800): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Simulate occasional failures (5% rate)
const simulateFailure = (failureRate = 0.05): boolean => {
  return Math.random() < failureRate;
};

export class EditorMockAPI {
  async getChapters(seriesId?: string): Promise<APIResponse<Chapter[]>> {
    await simulateDelay();

    const chapters = seriesId
      ? mockChapters.filter(ch => ch.seriesId === seriesId)
      : mockChapters;

    return {
      success: true,
      data: chapters,
    };
  }

  async getChapter(chapterId: string): Promise<APIResponse<Chapter>> {
    await simulateDelay();

    const chapter = mockChapters.find(ch => ch.id === chapterId);

    if (!chapter) {
      return {
        success: false,
        error: 'Chapter not found',
      };
    }

    return {
      success: true,
      data: chapter,
    };
  }

  async createChapter(
    title: string,
    content: string,
    seriesId: string
  ): Promise<APIResponse<Chapter>> {
    await simulateDelay(500, 1200);

    if (simulateFailure()) {
      return {
        success: false,
        error: 'Failed to create chapter',
      };
    }

    const originalParagraphs = content
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const newChapter: Chapter = {
      id: `ch${Date.now()}`,
      title,
      content,
      translatedContent: '',
      originalParagraphs,
      translatedParagraphs: [],
      seriesId,
    };

    mockChapters.push(newChapter);

    return {
      success: true,
      data: newChapter,
    };
  }

  async updateChapter(
    chapterId: string,
    updates: Partial<Chapter>
  ): Promise<APIResponse<Chapter>> {
    await simulateDelay();

    if (simulateFailure()) {
      return {
        success: false,
        error: 'Failed to update chapter',
      };
    }

    const index = mockChapters.findIndex(ch => ch.id === chapterId);

    if (index === -1) {
      return {
        success: false,
        error: 'Chapter not found',
      };
    }

    mockChapters[index] = { ...mockChapters[index], ...updates };

    return {
      success: true,
      data: mockChapters[index],
    };
  }

  async deleteChapter(chapterId: string): Promise<APIResponse<void>> {
    await simulateDelay();

    if (simulateFailure(0.02)) {
      return {
        success: false,
        error: 'Failed to delete chapter',
      };
    }

    const index = mockChapters.findIndex(ch => ch.id === chapterId);

    if (index === -1) {
      return {
        success: false,
        error: 'Chapter not found',
      };
    }

    mockChapters.splice(index, 1);

    return {
      success: true,
    };
  }

  async batchUpdateChapters(
    updates: Array<{ id: string; changes: Partial<Chapter> }>
  ): Promise<APIResponse<Chapter[]>> {
    await simulateDelay(800, 1500);

    if (simulateFailure()) {
      return {
        success: false,
        error: 'Batch update failed',
      };
    }

    const updatedChapters: Chapter[] = [];

    for (const update of updates) {
      const index = mockChapters.findIndex(ch => ch.id === update.id);
      if (index !== -1) {
        mockChapters[index] = { ...mockChapters[index], ...update.changes };
        updatedChapters.push(mockChapters[index]);
      }
    }

    return {
      success: true,
      data: updatedChapters,
    };
  }
}
