export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'error';
  date: string | Date;
  isActive: boolean;
  priority?: number;
}

export interface AnnouncementsState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  dismissedIds: string[];
}