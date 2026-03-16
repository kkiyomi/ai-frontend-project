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
import type { GlossaryTerm, GlossaryImportResponse } from '../types';
import mockData from '@/mock';

let mockGlossaryTerms = [...mockData.mockGlossaryTerms];

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

  async importGlossaryTerms(terms: Omit<GlossaryTerm, 'id' | 'frequency'>[]): Promise<APIResponse<GlossaryImportResponse>> {
    await simulateDelay(500, 1000);

    const results: GlossaryTerm[] = [];
    const failed: Array<{ row: number; error: string }> = [];
    
    terms.forEach((term, index) => {
      // Validate required fields
      if (!term.term?.trim() || !term.seriesId?.trim() || !term.translation?.trim()) {
        failed.push({ row: index + 1, error: 'Missing required field: term, seriesId, or translation' });
        return;
      }

      // Check for duplicates in this batch
      const duplicateInBatch = results.some(t => 
        t.term.toLowerCase() === term.term.toLowerCase() && t.seriesId === term.seriesId
      );
      if (duplicateInBatch) {
        failed.push({ row: index + 1, error: 'Duplicate term in this import batch' });
        return;
      }

      // Check for duplicates in existing mock data
      const existingTerm = mockGlossaryTerms.find(
        t => t.term.toLowerCase() === term.term.toLowerCase() && t.seriesId === term.seriesId
      );
      if (existingTerm) {
        failed.push({ row: index + 1, error: 'Term already exists in this series' });
        return;
      }

      const newTerm: GlossaryTerm = {
        ...term,
        id: `term${Date.now()}-${index}`,
        frequency: 1,
      };

      mockGlossaryTerms.push(newTerm);
      results.push(newTerm);
    });

    return {
      success: true,
      data: {
        created_count: results.length,
        failed_count: failed.length,
        failed,
        terms: results,
      },
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
