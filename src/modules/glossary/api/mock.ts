/**
 * Glossary Module - Mock API Implementation
 *
 * This file provides in-memory mock CRUD operations for glossary terms.
 * Used during development when no real backend is available.
 *
 * IMPORTANT: This is feature-specific mock logic that belongs to Glossary module,
 * NOT in Core infrastructure.
 */

import type { APIResponse } from '@/modules/core';
import type { GlossaryTerm } from '../types';
import mockGlossaryTermsData from '@/mock/glossaryTerms';

let mockGlossaryTerms = [...mockGlossaryTermsData];

const simulateDelay = (min = 200, max = 500): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

export class GlossaryMockAPI {
  async getGlossaryTerms(seriesId?: string, chapterId?: string): Promise<APIResponse<GlossaryTerm[]>> {
    await simulateDelay();

    let filteredTerms = [...mockGlossaryTerms];

    if (chapterId) {
      filteredTerms = filteredTerms.filter(term =>
        term.chapterId === chapterId ||
        (term.seriesId === seriesId && !term.chapterId)
      );
    } else if (seriesId) {
      filteredTerms = filteredTerms.filter(term => term.seriesId === seriesId);
    }

    return {
      success: true,
      data: filteredTerms,
    };
  }

  async createGlossaryTerm(term: Omit<GlossaryTerm, 'id' | 'frequency'>): Promise<APIResponse<GlossaryTerm>> {
    await simulateDelay(400, 800);

    const existingTerm = mockGlossaryTerms.find(
      t => t.term.toLowerCase() === term.term.toLowerCase() && t.seriesId === term.seriesId
    );

    if (existingTerm) {
      return {
        success: false,
        error: 'Term already exists in this series'
      };
    }

    const newTerm: GlossaryTerm = {
      ...term,
      id: `term${Date.now()}`,
      frequency: 1,
    };

    mockGlossaryTerms.push(newTerm);

    return {
      success: true,
      data: newTerm,
    };
  }

  async updateGlossaryTerm(termId: string, updates: Partial<GlossaryTerm>): Promise<APIResponse<GlossaryTerm>> {
    await simulateDelay(300, 600);

    const index = mockGlossaryTerms.findIndex(t => t.id === termId);
    if (index === -1) {
      return {
        success: false,
        error: 'Glossary term not found'
      };
    }

    mockGlossaryTerms[index] = { ...mockGlossaryTerms[index], ...updates };

    return {
      success: true,
      data: mockGlossaryTerms[index],
    };
  }

  async deleteGlossaryTerm(termId: string): Promise<APIResponse<void>> {
    await simulateDelay(300, 600);

    const index = mockGlossaryTerms.findIndex(t => t.id === termId);
    if (index === -1) {
      return {
        success: false,
        error: 'Glossary term not found'
      };
    }

    mockGlossaryTerms.splice(index, 1);

    return {
      success: true,
    };
  }
}
