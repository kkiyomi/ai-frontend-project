import type { APIResponse } from '@/modules/core/types';
import type { Series, CreateSeriesRequest, UpdateSeriesRequest, Language } from '../types';
import mockData from '@/mock';

let mockSeries = mockData.mockSeries;

const MOCK_LANGUAGES: Language[] = [
  { code: 'en_US', name: 'English', isoCode: 'en' },
  { code: 'zh_CN', name: 'Chinese (Simplified)', isoCode: 'zh' },
  { code: 'zh_TW', name: 'Chinese (Traditional)', isoCode: 'zh' },
  { code: 'ja_JP', name: 'Japanese', isoCode: 'ja' },
  { code: 'ko_KR', name: 'Korean', isoCode: 'ko' },
  { code: 'es_ES', name: 'Spanish', isoCode: 'es' },
  { code: 'fr_FR', name: 'French', isoCode: 'fr' },
  { code: 'de_DE', name: 'German', isoCode: 'de' },
  { code: 'pt_BR', name: 'Portuguese (Brazil)', isoCode: 'pt' },
  { code: 'ru_RU', name: 'Russian', isoCode: 'ru' },
  { code: 'th_TH', name: 'Thai', isoCode: 'th' },
  { code: 'vi_VN', name: 'Vietnamese', isoCode: 'vi' },
];

export class SeriesMockAPI {
  private series: Series[] = mockSeries;

  async getSeries(): Promise<APIResponse<Series[]>> {
    await this.simulateDelay();
    return {
      success: true,
      data: [...this.series]
    };
  }

  async getSeriesById(seriesId: string): Promise<APIResponse<Series>> {
    await this.simulateDelay();
    const series = this.series.find(s => s.id === seriesId);

    if (!series) {
      return {
        success: false,
        error: 'Series not found'
      };
    }

    return {
      success: true,
      data: { ...series }
    };
  }

  async createSeries(request: CreateSeriesRequest): Promise<APIResponse<Series>> {
    await this.simulateDelay();

    const newSeries: Series = {
      id: `s${Date.now()}`,
      name: request.name,
      description: request.description,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      createdAt: new Date(),
      chapterIds: []
    };

    this.series.push(newSeries);

    return {
      success: true,
      data: newSeries
    };
  }

  async updateSeries(seriesId: string, request: UpdateSeriesRequest): Promise<APIResponse<Series>> {
    await this.simulateDelay();

    const index = this.series.findIndex(s => s.id === seriesId);

    if (index === -1) {
      return {
        success: false,
        error: 'Series not found'
      };
    }

    this.series[index] = {
      ...this.series[index],
      ...request
    };

    return {
      success: true,
      data: { ...this.series[index] }
    };
  }

  async deleteSeries(seriesId: string): Promise<APIResponse<void>> {
    await this.simulateDelay();

    const index = this.series.findIndex(s => s.id === seriesId);

    if (index === -1) {
      return {
        success: false,
        error: 'Series not found'
      };
    }

    this.series.splice(index, 1);

    return {
      success: true
    };
  }

  async getLanguages(): Promise<APIResponse<Language[]>> {
    await this.simulateDelay();
    return {
      success: true,
      data: [...MOCK_LANGUAGES]
    };
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  }
}
