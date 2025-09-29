// Cross-domain API service - handles all API communication
import { MockAPI } from './mockAPI.js';
import { RealAPI } from './realAPI.js';
import { shouldUseMockAPI } from './environmentService.js';

// Singleton pattern for API service
class APIService {
  static instance = null;
  apiInstance = null;
  initializationPromise = null;

  static getInstance() {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  async initializeAPI() {
    if (this.apiInstance) return;

    const useMock = await shouldUseMockAPI();
    
    if (useMock) {
      console.log('🔧 Using mock API for development');
      this.apiInstance = new MockAPI();
    } else {
      console.log('🌐 Using real API:', import.meta.env.VITE_API_BASE_URL);
      this.apiInstance = new RealAPI(import.meta.env.VITE_API_BASE_URL);
    }
  }

  async getAPI() {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeAPI();
    }
    await this.initializationPromise;
    return this.apiInstance;
  }

  // Translation methods
  async translateText(text, glossaryContext) {
    const api = await this.getAPI();
    return api.translateText(text, glossaryContext);
  }

  async translateParagraph(text, chapterId, paragraphIndex, glossaryContext) {
    const api = await this.getAPI();
    return api.translateParagraph?.(text, chapterId, paragraphIndex, glossaryContext) || api.translateText(text, glossaryContext);
  }

  async retranslateWithGlossary(originalText, currentTranslation, glossaryTerms) {
    const api = await this.getAPI();
    return api.retranslateWithGlossary(originalText, currentTranslation, glossaryTerms);
  }

  async suggestGlossaryTerms(text) {
    const api = await this.getAPI();
    return api.suggestGlossaryTerms(text);
  }

  // Series methods
  async getSeries() {
    const api = await this.getAPI();
    return api.getSeries();
  }

  async createSeries(name, description) {
    const api = await this.getAPI();
    return api.createSeries(name, description);
  }

  async updateSeries(seriesId, updates) {
    const api = await this.getAPI();
    return api.updateSeries(seriesId, updates);
  }

  async deleteSeries(seriesId) {
    const api = await this.getAPI();
    return api.deleteSeries(seriesId);
  }

  // Chapter methods
  async getChapters(seriesId) {
    const api = await this.getAPI();
    return api.getChapters(seriesId);
  }

  async createChapter(title, content, seriesId) {
    const api = await this.getAPI();
    return api.createChapter(title, content, seriesId);
  }

  async updateChapter(chapterId, updates) {
    const api = await this.getAPI();
    return api.updateChapter(chapterId, updates);
  }

  async deleteChapter(chapterId) {
    const api = await this.getAPI();
    return api.deleteChapter(chapterId);
  }

  // Glossary methods
  async getGlossaryTerms(seriesId, chapterId) {
    const api = await this.getAPI();
    return api.getGlossaryTerms(seriesId, chapterId);
  }

  async createGlossaryTerm(term) {
    const api = await this.getAPI();
    return api.createGlossaryTerm(term);
  }

  async updateGlossaryTerm(termId, updates) {
    const api = await this.getAPI();
    return api.updateGlossaryTerm(termId, updates);
  }

  async deleteGlossaryTerm(termId) {
    const api = await this.getAPI();
    return api.deleteGlossaryTerm(termId);
  }

  // Sharing methods
  async createShare(request) {
    const api = await this.getAPI();
    return api.createShare(request);
  }

  async getSharedContent(shareId) {
    const api = await this.getAPI();
    return api.getSharedContent(shareId);
  }

  async deleteShare(shareId) {
    const api = await this.getAPI();
    return api.deleteShare(shareId);
  }

  async verifySharePassword(shareId, password) {
    const api = await this.getAPI();
    return api.verifySharePassword?.(shareId, password);
  }
}

// Export singleton instance
export const apiService = APIService.getInstance();