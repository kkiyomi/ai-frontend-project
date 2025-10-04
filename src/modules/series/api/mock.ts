import type { APIResponse } from '@/modules/core/types';
import type { Series, CreateSeriesRequest, UpdateSeriesRequest } from '../types';
import mockSeriesData from '@/mock/series';

export class SeriesMockAPI {
  private series: Series[] = [...mockSeriesData];

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

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  }
}
