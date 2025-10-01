/**
 * Glossary Module - Real API Implementation
 *
 * This file defines the real HTTP endpoints for glossary CRUD operations.
 * Uses Core's generic APIClient for HTTP communication.
 *
 * IMPORTANT: This is feature-specific API logic. Core module does NOT know about
 * glossary endpoints - each feature module owns its own API definitions.
 */

import { APIClient, type APIResponse } from '@/modules/core';
import type { GlossaryTerm } from '../types';

export class GlossaryRealAPI {
  private client: APIClient;

  constructor(baseURL: string) {
    this.client = new APIClient(baseURL);
  }

  async getGlossaryTerms(seriesId?: string, chapterId?: string): Promise<APIResponse<GlossaryTerm[]>> {
    const params = new URLSearchParams();

    if (chapterId) {
      params.append('chapterId', chapterId);
      if (seriesId) {
        params.append('seriesId', seriesId);
      }
    } else if (seriesId) {
      params.append('seriesId', seriesId);
    }

    const query = params.toString() ? `?${params.toString()}` : '';

    return this.client.get<GlossaryTerm[]>(`/glossary-terms${query}`);
  }

  async createGlossaryTerm(term: Omit<GlossaryTerm, 'id' | 'frequency'>): Promise<APIResponse<GlossaryTerm>> {
    return this.client.post<GlossaryTerm>('/glossary-terms', term);
  }

  async updateGlossaryTerm(termId: string, updates: Partial<GlossaryTerm>): Promise<APIResponse<GlossaryTerm>> {
    return this.client.patch<GlossaryTerm>(`/glossary-terms/${termId}`, updates);
  }

  async deleteGlossaryTerm(termId: string): Promise<APIResponse<void>> {
    return this.client.delete<void>(`/glossary-terms/${termId}`);
  }
}
