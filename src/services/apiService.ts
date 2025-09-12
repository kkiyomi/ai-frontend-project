import { MockAPI } from './mockAPI';
import { RealAPI } from './realAPI';
import { shouldUseMockAPI } from '../utils/environment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Singleton pattern for API service
class APIService {
  private static instance: APIService | null = null;
  private apiInstance: MockAPI | RealAPI | null = null;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  private async initializeAPI(): Promise<void> {
    if (this.apiInstance) return;

    const useMock = await shouldUseMockAPI();
    
    if (useMock) {
      console.log('🔧 Using mock API for development');
      this.apiInstance = new MockAPI();
    } else {
      console.log('🌐 Using real API:', API_BASE_URL);
      this.apiInstance = new RealAPI(API_BASE_URL);
    }
  }

  private async getAPI(): Promise<MockAPI | RealAPI> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeAPI();
    }
    await this.initializationPromise;
    return this.apiInstance!;
  }

  // Translation methods
  async translateText(text: string, glossaryContext?: string[]) {
    const api = await this.getAPI();
    return api.translateText(text, glossaryContext);
  }

  async retranslateWithGlossary(originalText: string, currentTranslation: string, glossaryTerms: string[]) {
    const api = await this.getAPI();
    return api.retranslateWithGlossary(originalText, currentTranslation, glossaryTerms);
  }

  async suggestGlossaryTerms(text: string) {
    const api = await this.getAPI();
    return api.suggestGlossaryTerms(text);
  }

  // Series methods
  async getSeries() {
    const api = await this.getAPI();
    return api.getSeries();
  }

  async createSeries(name: string, description?: string) {
    const api = await this.getAPI();
    return api.createSeries(name, description);
  }

  async updateSeries(seriesId: string, updates: any) {
    const api = await this.getAPI();
    return api.updateSeries(seriesId, updates);
  }

  async deleteSeries(seriesId: string) {
    const api = await this.getAPI();
    return api.deleteSeries(seriesId);
  }

  // Chapter methods
  async getChapters(seriesId?: string) {
    const api = await this.getAPI();
    return api.getChapters(seriesId);
  }

  async createChapter(title: string, content: string, seriesId: string) {
    const api = await this.getAPI();
    return api.createChapter(title, content, seriesId);
  }

  async updateChapter(chapterId: string, updates: any) {
    const api = await this.getAPI();
    return api.updateChapter(chapterId, updates);
  }

  async deleteChapter(chapterId: string) {
    const api = await this.getAPI();
    return api.deleteChapter(chapterId);
  }

  // Glossary methods
  async getGlossaryTerms(seriesId?: string, chapterId?: string) {
    const api = await this.getAPI();
    return api.getGlossaryTerms(seriesId, chapterId);
  }

  async createGlossaryTerm(term: any) {
    const api = await this.getAPI();
    return api.createGlossaryTerm(term);
  }

  async updateGlossaryTerm(termId: string, updates: any) {
    const api = await this.getAPI();
    return api.updateGlossaryTerm(termId, updates);
  }

  async deleteGlossaryTerm(termId: string) {
    const api = await this.getAPI();
    return api.deleteGlossaryTerm(termId);
  }

  // Sharing methods
  async createShare(request: any) {
    const api = await this.getAPI();
    return api.createShare(request);
  }

  async getSharedContent(shareId: string) {
    const api = await this.getAPI();
    return api.getSharedContent(shareId);
  }

  async deleteShare(shareId: string) {
    const api = await this.getAPI();
    return api.deleteShare(shareId);
  }

  async verifySharePassword(shareId: string, password: string) {
    const api = await this.getAPI();
    return (api as any).verifySharePassword?.(shareId, password);
  }
}

// Export singleton instance
export const apiService = APIService.getInstance();