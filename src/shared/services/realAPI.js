// Real API implementation - moved from services/realAPI.js
import { APIClient } from './apiClient.js';

export class RealAPI {
  constructor(baseURL) {
    this.client = new APIClient(baseURL);
  }

  // Translation endpoints
  async translateText(text, glossaryContext) {
    return this.client.post('/translate', {
      text,
      glossaryContext
    });
  }

  async translateParagraph(text, chapterId, paragraphIndex, glossaryContext) {
    return this.client.post('/translate-paragraph', {
      text,
      chapterId,
      paragraphIndex,
      glossaryContext
    });
  }

  async retranslateWithGlossary(originalText, currentTranslation, glossaryTerms) {
    return this.client.post('/retranslate', {
      originalText,
      currentTranslation,
      glossaryTerms
    });
  }

  async suggestGlossaryTerms(text) {
    return this.client.post('/suggest-terms', { text });
  }

  // Series endpoints
  async getSeries() {
    return this.client.get('/series');
  }

  async createSeries(name, description) {
    return this.client.post('/series', { name, description });
  }

  async updateSeries(seriesId, updates) {
    return this.client.patch(`/series/${seriesId}`, updates);
  }

  async deleteSeries(seriesId) {
    return this.client.delete(`/series/${seriesId}`);
  }

  // Chapter endpoints
  async getChapters(seriesId) {
    const endpoint = seriesId ? `/chapters?seriesId=${seriesId}` : '/chapters';
    return this.client.get(endpoint);
  }

  async createChapter(title, content, seriesId) {
    return this.client.post('/chapters', {
      title,
      content,
      seriesId
    });
  }

  async updateChapter(chapterId, updates) {
    return this.client.patch(`/chapters/${chapterId}`, updates);
  }

  async deleteChapter(chapterId) {
    return this.client.delete(`/chapters/${chapterId}`);
  }

  // Glossary endpoints
  async getGlossaryTerms(seriesId, chapterId) {
    const params = new URLSearchParams();
    
    if (chapterId) {
      params.append('chapterId', chapterId);
      if (seriesId) {
        params.append('seriesId', seriesId);
      }
    } else if (seriesId) {
      params.append('seriesId', seriesId);
    }
    
    const additionalParams = params.toString() ? `?${params.toString()}` : '';
    
    return this.client.get('/glossary-terms' + additionalParams);
  }

  async createGlossaryTerm(term) {
    return this.client.post('/glossary-terms', term);
  }

  async updateGlossaryTerm(termId, updates) {
    return this.client.patch(`/glossary-terms/${termId}`, updates);
  }

  async deleteGlossaryTerm(termId) {
    return this.client.delete(`/glossary-terms/${termId}`);
  }

  // Sharing endpoints
  async createShare(request) {
    return this.client.post('/share', request);
  }

  async getSharedContent(shareId) {
    return this.client.get(`/share/${shareId}`);
  }

  async deleteShare(shareId) {
    return this.client.delete(`/share/${shareId}`);
  }

  async verifySharePassword(shareId, password) {
    return this.client.post(`/share/${shareId}/verify-password`, { password });
  }
}