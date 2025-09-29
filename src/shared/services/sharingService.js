// Sharing service - handles sharing and collaboration logic
import { apiService } from './apiService.js';

class SharingService {
  async createShare(request) {
    const response = await apiService.createShare(request);
    if (response.success) {
      return response;
    }
    throw new Error(response.error || 'Failed to create share');
  }

  async getSharedContent(shareId) {
    const response = await apiService.getSharedContent(shareId);
    if (response.success) {
      return response;
    }
    throw new Error(response.error || 'Failed to get shared content');
  }

  async deleteShare(shareId) {
    const response = await apiService.deleteShare(shareId);
    if (response.success) {
      return response;
    }
    throw new Error(response.error || 'Failed to delete share');
  }

  async verifySharePassword(shareId, password) {
    const response = await apiService.verifySharePassword(shareId, password);
    if (response.success) {
      return response;
    }
    throw new Error(response.error || 'Failed to verify password');
  }
}

export const sharingService = new SharingService();