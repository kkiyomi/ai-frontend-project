import type { APIResponse } from '../types';
import { apiService } from '../services/apiService';

export function useAPI() {
  const translateText = async (
    text: string, 
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> => {
    return apiService.translateText(text, glossaryContext);
  };

  const retranslateWithGlossary = async (
    originalText: string,
    currentTranslation: string,
    glossaryTerms: string[]
  ): Promise<APIResponse<string>> => {
    return apiService.retranslateWithGlossary(originalText, currentTranslation, glossaryTerms);
  };

  const suggestGlossaryTerms = async (text: string): Promise<APIResponse<string[]>> => {
    return apiService.suggestGlossaryTerms(text);
  };

  return {
    translateText,
    retranslateWithGlossary,
    suggestGlossaryTerms,
  };
}

// Additional API functions for data management
export function useDataAPI() {
  // Series operations
  const getSeries = async () => {
    return apiService.getSeries();
  };

  const createSeries = async (name: string, description?: string) => {
    return apiService.createSeries(name, description);
  };

  const deleteSeries = async (seriesId: string) => {
    return apiService.deleteSeries(seriesId);
  };

  // Chapter operations
  const getChapters = async (seriesId?: string) => {
    return apiService.getChapters(seriesId);
  };

  const createChapter = async (title: string, content: string, seriesId: string) => {
    return apiService.createChapter(title, content, seriesId);
  };

  const deleteChapter = async (chapterId: string) => {
    return apiService.deleteChapter(chapterId);
  };

  // Glossary operations
  const getGlossaryTerms = async () => {
    return apiService.getGlossaryTerms();
  };

  const createGlossaryTerm = async (term: Omit<import('../types').GlossaryTerm, 'id' | 'frequency'>) => {
    return apiService.createGlossaryTerm(term);
  };

  const updateGlossaryTerm = async (termId: string, updates: Partial<import('../types').GlossaryTerm>) => {
    return apiService.updateGlossaryTerm(termId, updates);
  };

  const deleteGlossaryTerm = async (termId: string) => {
    return apiService.deleteGlossaryTerm(termId);
  };

  return {
    // Series
    getSeries,
    createSeries,
    deleteSeries,
    // Chapters
    getChapters,
    createChapter,
    deleteChapter,
    // Glossary
    getGlossaryTerms,
    createGlossaryTerm,
    updateGlossaryTerm,
    deleteGlossaryTerm,
  };
}