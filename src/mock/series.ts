import type { Series } from '../types';

const mockSeries: Series[] = [
  {
    id: 's1',
    name: 'Swallowed Star 2: Origin Continent',
    description: 'Luo Feng, accompanied by Boundary Beast Morosa, traversed reincarnation and arrived at the Origin Continent…',
    sourceLanguage: 'zh-CN',
    targetLanguage: 'en-US',
    createdAt: new Date('2024-01-15'),
    chapterIds: ['ch1'],
    chapters: []
  },
  {
    id: 's2',
    name: 'Tales of the Ancient Realm',
    description: 'Epic stories from a world where magic and technology coexist',
    sourceLanguage: 'zh-CN',
    targetLanguage: 'en-US',
    createdAt: new Date('2024-02-01'),
    chapterIds: [],
    chapters: []
  }
];

export default mockSeries;