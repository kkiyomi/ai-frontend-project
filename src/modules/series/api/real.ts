import type { APIResponse } from '@/modules/core/types';
import type { Series, CreateSeriesRequest, UpdateSeriesRequest } from '../types';

export class RealSeriesAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getSeries(): Promise<APIResponse<Series[]>> {
    try {
      const response = await fetch(`${this.baseURL}/series`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt)
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch series'
      };
    }
  }

  async getSeriesById(seriesId: string): Promise<APIResponse<Series>> {
    try {
      const response = await fetch(`${this.baseURL}/series/${seriesId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          ...data,
          createdAt: new Date(data.createdAt)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch series'
      };
    }
  }

  async createSeries(request: CreateSeriesRequest): Promise<APIResponse<Series>> {
    try {
      const response = await fetch(`${this.baseURL}/series`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          ...data,
          createdAt: new Date(data.createdAt)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create series'
      };
    }
  }

  async updateSeries(seriesId: string, request: UpdateSeriesRequest): Promise<APIResponse<Series>> {
    try {
      const response = await fetch(`${this.baseURL}/series/${seriesId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          ...data,
          createdAt: new Date(data.createdAt)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update series'
      };
    }
  }

  async deleteSeries(seriesId: string): Promise<APIResponse<void>> {
    try {
      const response = await fetch(`${this.baseURL}/series/${seriesId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete series'
      };
    }
  }
}
