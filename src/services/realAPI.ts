import type { APIResponse, GlossaryTerm, Series, Chapter } from '../types';
import type { ShareRequest, ShareResponse, SharedContent } from '../types/sharing';
import { APIClient } from './apiClient';

export class RealAPI {
  private client: APIClient;

  constructor(baseURL: string) {
    this.client = new APIClient(baseURL);
  }

  // Translation endpoints
  async translateText(
    text: string, 
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> {
    return this.client.post<string>('/translate', {
      text,
      glossaryContext
    });
  }

  async translateParagraph(
    text: string,
    chapterId: string,
    paragraphIndex: number,
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> {
    return this.client.post<string>('/translate-paragraph', {
      text,
      chapterId,
      paragraphIndex,
      glossaryContext
    });
  }
  async retranslateWithGlossary(
    originalText: string,
    currentTranslation: string,
    glossaryTerms: string[]
  ): Promise<APIResponse<string>> {
    return this.client.post<string>('/retranslate', {
      originalText,
      currentTranslation,
      glossaryTerms
    });
  }

  async suggestGlossaryTerms(text: string): Promise<APIResponse<string[]>> {
    return this.client.post<string[]>('/suggest-terms', { text });
  }

  // Series endpoints
  async getSeries(): Promise<APIResponse<Series[]>> {
    return this.client.get<Series[]>('/series');
  }

  async createSeries(name: string, description?: string): Promise<APIResponse<Series>> {
    return this.client.post<Series>('/series', { name, description });
  }

  async updateSeries(seriesId: string, updates: Partial<Series>): Promise<APIResponse<Series>> {
    return this.client.patch<Series>(`/series/${seriesId}`, updates);
  }

  async deleteSeries(seriesId: string): Promise<APIResponse<void>> {
    return this.client.delete<void>(`/series/${seriesId}`);
  }

  // Chapter endpoints
  async getChapters(seriesId?: string): Promise<APIResponse<Chapter[]>> {
    const endpoint = seriesId ? `/chapters?seriesId=${seriesId}` : '/chapters';
    return this.client.get<Chapter[]>(endpoint);
  }

  async createChapter(
    title: string, 
    content: string, 
    seriesId: string
  ): Promise<APIResponse<Chapter>> {
    return this.client.post<Chapter>('/chapters', {
      title,
      content,
      seriesId
    });
  }

  async updateChapter(chapterId: string, updates: Partial<Chapter>): Promise<APIResponse<Chapter>> {
    return this.client.patch<Chapter>(`/chapters/${chapterId}`, updates);
  }

  async deleteChapter(chapterId: string): Promise<APIResponse<void>> {
    return this.client.delete<void>(`/chapters/${chapterId}`);
  }

  // Glossary endpoints
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
    let additional_params = '';
    if (params.toString()) {
      additional_params += `?${params.toString()}`;
    }
    
    return this.client.get<GlossaryTerm[]>('/glossary-terms' + additional_params);
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

  // Sharing endpoints
  async createShare(request: ShareRequest): Promise<APIResponse<ShareResponse>> {
    return this.client.post<ShareResponse>('/share', request);
  }

  async getSharedContent(shareId: string): Promise<APIResponse<SharedContent>> {
    return this.client.get<SharedContent>(`/share/${shareId}`);
  }

  async deleteShare(shareId: string): Promise<APIResponse<void>> {
    return this.client.delete<void>(`/share/${shareId}`);
  }

  async verifySharePassword(shareId: string, password: string): Promise<APIResponse<boolean>> {
    return this.client.post<boolean>(`/share/${shareId}/verify-password`, { password });
  }
}