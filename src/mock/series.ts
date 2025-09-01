import type { Series } from '@/types/api';
import mockChapters from './chapters';

const mockSeries: Series[] = [
  {
    id: 's1',
    name: 'Mock Series One',
    description: 'A fake series for testing.',
    createdAt: new Date(),
    chapters: mockChapters
  },
  {
    id: 's2',
    name: 'Mock Series Two',
    createdAt: new Date(),
    chapters: []
  }
];

export default mockSeries;
