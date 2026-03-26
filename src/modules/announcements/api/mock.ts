import type { APIResponse } from '@/modules/core/types';
import type { Announcement } from '../types';

export class AnnouncementsMockAPI {
  async getAnnouncements(): Promise<APIResponse<Announcement[]>> {
    await this.simulateDelay();
    
    // Add mock disclaimer when in mock mode
    const announcements = [{
      id: 'mock-disclaimer',
      title: 'Mock Database',
      content: 'This is just a mock database and no data are saved. Create an account to persist changes.',
      type: 'warning',
      date: new Date(),
      isActive: true,
      priority: 100
    },
    {
      id: 'ann-1',
      title: 'Welcome to the Application',
      content: 'This is a sample announcement. You can dismiss it by clicking the close button.',
      type: 'info',
      date: new Date(),
      isActive: true,
      priority: 1
    }];
    return {
      success: true,
      data: announcements
    };
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  }
}