import { useAPI } from '@/modules/core';
import type { GlossaryTerm } from './types';

export function createGlossaryAPI() {
  const coreAPI = useAPI();

  return {
    async getGlossaryTerms(seriesId?: string, chapterId?: string) {
      return coreAPI.getGlossaryTerms(seriesId, chapterId);
    },

    async createGlossaryTerm(term: Omit<GlossaryTerm, 'id' | 'frequency'>) {
      return coreAPI.createGlossaryTerm(term);
    },

    async updateGlossaryTerm(termId: string, updates: Partial<GlossaryTerm>) {
      return coreAPI.updateGlossaryTerm(termId, updates);
    },

    async deleteGlossaryTerm(termId: string) {
      return coreAPI.deleteGlossaryTerm(termId);
    },

    clearCache() {
      coreAPI.clearCacheByPattern('getGlossaryTerms');
    }
  };
}
