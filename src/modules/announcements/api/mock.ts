import type { APIResponse } from '@/modules/core/types';
import type { Announcement } from '../types';
import mockData from '@/mock';

export class AnnouncementsMockAPI {
  private announcements: Announcement[] = mockData.mockAnnouncements || [];

  async getAnnouncements(): Promise<APIResponse<Announcement[]>> {
    await this.simulateDelay();
    
    // Add mock disclaimer when in mock mode
    const announcements = [...this.announcements];
    const hasMockDisclaimer = announcements.some(a => a.id === 'mock-disclaimer');
    
    if (!hasMockDisclaimer) {
      announcements.unshift({
        id: 'mock-disclaimer',
        title: 'Mock Database',
        content: 'This is just a mock database and no data are saved. Switch to real API to persist changes.',
        type: 'warning',
        date: new Date(),
        isActive: true,
        priority: 100
      });
    }
    
    return {
      success: true,
      data: announcements.filter(a => a.isActive)
    };
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  }
}