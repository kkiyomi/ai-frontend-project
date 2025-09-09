import type { APIResponse, Series, Chapter, GlossaryTerm} from '../types';
import type { ShareRequest, ShareResponse, SharedContent } from '../types/sharing';
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

  const getGlossaryTerms = async (seriesId?: string, chapterId?: string): Promise<APIResponse<GlossaryTerm[]>> => {
    return apiService.getGlossaryTerms(seriesId, chapterId);
  };

  const createGlossaryTerm = async (term: Omit<GlossaryTerm, 'id' | 'frequency'>) => {
    return apiService.createGlossaryTerm(term);
  };

  const updateGlossaryTerm = async (termId: string, updates: Partial<GlossaryTerm>) => {
    return apiService.updateGlossaryTerm(termId, updates);
  };

  const deleteGlossaryTerm = async (termId: string) => {
    return apiService.deleteGlossaryTerm(termId);
  };

  // Sharing functions
  const createShare = async (request: ShareRequest) => {
    return apiService.createShare(request);
  };

  const getSharedContent = async (shareId: string) => {
    return apiService.getSharedContent(shareId);
  };

  const deleteShare = async (shareId: string) => {
    return apiService.deleteShare(shareId);
  };

  return {
    translateText,
    retranslateWithGlossary,
    suggestGlossaryTerms,
    getGlossaryTerms,
    createGlossaryTerm,
    updateGlossaryTerm,
    deleteGlossaryTerm,
    createShare,
    getSharedContent,
    deleteShare,
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

  const updateSeries = async (seriesId: string, updates: Partial<Series>) => {
    return apiService.updateSeries(seriesId, updates);
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

  const updateChapter = async (chapterId: string, updates: Partial<Chapter>) => {
    return apiService.updateChapter(chapterId, updates);
  };

  const deleteChapter = async (chapterId: string) => {
    return apiService.deleteChapter(chapterId);
  };

  return {
    // Series
    getSeries,
    createSeries,
    updateSeries,
    deleteSeries,
    // Chapters
    getChapters,
    createChapter,
    updateChapter,
    deleteChapter,
  };
}