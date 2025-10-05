import type { APIResponse } from '@/modules/core';
import type { Chapter, ChapterCreateInput, ChapterUpdateInput } from '../types';
import mockData from '@/mock';

let mockChapters = [...mockData.mockChapters];

const simulateDelay = (min = 200, max = 800): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const simulateFailure = (failureRate = 0.05): boolean => {
  return Math.random() < failureRate;
};

export class ChapterMockAPI {
  async getChapters(seriesId?: string): Promise<APIResponse<Chapter[]>> {
    await simulateDelay(200, 600);

    const chapters = seriesId
      ? mockChapters.filter(ch => ch.seriesId === seriesId)
      : mockChapters;

    return {
      success: true,
      data: chapters,
    };
  }

  async createChapter(input: ChapterCreateInput): Promise<APIResponse<Chapter>> {
    await simulateDelay(800, 1500);

    if (simulateFailure(0.03)) {
      return {
        success: false,
        error: 'Failed to create chapter'
      };
    }

    const originalParagraphs = input.content
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const newChapter: Chapter = {
      id: `ch${Date.now()}`,
      title: input.title,
      content: input.content,
      translatedContent: '',
      originalParagraphs,
      translatedParagraphs: [],
      seriesId: input.seriesId,
      isTranslated: false
    };

    mockChapters.push(newChapter);

    return {
      success: true,
      data: newChapter,
    };
  }

  async updateChapter(chapterId: string, updates: ChapterUpdateInput): Promise<APIResponse<Chapter>> {
    await simulateDelay(300, 600);

    const index = mockChapters.findIndex(ch => ch.id === chapterId);
    if (index === -1) {
      return {
        success: false,
        error: 'Chapter not found'
      };
    }

    mockChapters[index] = { ...mockChapters[index], ...updates };

    if (updates.content) {
      mockChapters[index].originalParagraphs = updates.content
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);
    }

    if (updates.translatedContent) {
      mockChapters[index].translatedParagraphs = updates.translatedContent
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);
    }

    return {
      success: true,
      data: mockChapters[index],
    };
  }

  async deleteChapter(chapterId: string): Promise<APIResponse<void>> {
    await simulateDelay(300, 600);

    const index = mockChapters.findIndex(ch => ch.id === chapterId);
    if (index === -1) {
      return {
        success: false,
        error: 'Chapter not found'
      };
    }

    mockChapters.splice(index, 1);

    return {
      success: true,
    };
  }
}
