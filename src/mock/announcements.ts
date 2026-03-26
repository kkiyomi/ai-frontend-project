import type { Announcement } from '@/modules/announcements/types';

const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Welcome to the Application',
    content: 'This is a sample announcement. You can dismiss it by clicking the close button.',
    type: 'info',
    date: new Date(),
    isActive: true,
    priority: 1
  },
  {
    id: 'ann-2',
    title: 'Mock Mode Active',
    content: 'This is just a mock database and no data are saved. Switch to real API to persist changes.',
    type: 'warning',
    date: new Date(),
    isActive: true,
    priority: 2
  }
];

export default mockAnnouncements;