import type { Series } from '../types';

const mockSeries: Series[] = [
  {
    id: 's1',
    name: 'The Chronicles of Elderbrook',
    description: 'A fantasy adventure following young Aria as she discovers her magical abilities',
    createdAt: new Date('2024-01-15'),
    chapters: [] // Will be populated by mockAPI
  },
  {
    id: 's2',
    name: 'Tales of the Ancient Realm',
    description: 'Epic stories from a world where magic and technology coexist',
    createdAt: new Date('2024-02-01'),
    chapters: [] // Will be populated by mockAPI
  }
];

export default mockSeries;