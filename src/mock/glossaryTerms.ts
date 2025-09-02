import type { GlossaryTerm } from '../types';

const mockGlossaryTerms: GlossaryTerm[] = [
  // Chapter 1 terms
  {
    id: 'term1',
    term: 'Elderbrook',
    definition: 'A small, peaceful village nestled in the valley',
    translation: 'Arroyo del Anciano',
    category: 'place',
    frequency: 3,
    isUserDefined: false,
    seriesId: 's1',
    chapterId: 'ch1'
  },
  {
    id: 'term2',
    term: 'Aria',
    definition: 'The young protagonist of our story',
    translation: 'Aria',
    category: 'character',
    frequency: 8,
    isUserDefined: false,
    seriesId: 's1',
    chapterId: 'ch1'
  },
  {
    id: 'term3',
    term: 'ancient arts',
    definition: 'Magical practices passed down through generations',
    translation: 'artes ancestrales',
    category: 'cultural',
    frequency: 2,
    isUserDefined: false,
    seriesId: 's1',
    chapterId: 'ch1'
  },
  {
    id: 'term4',
    term: 'wizard',
    definition: 'A practitioner of magic and keeper of ancient knowledge',
    translation: 'mago',
    category: 'character',
    frequency: 5,
    isUserDefined: false,
    seriesId: 's1',
    chapterId: 'ch1'
  },
  // Chapter 2 terms
  {
    id: 'term5',
    term: 'runes',
    definition: 'Ancient magical symbols with mystical properties',
    translation: 'runas',
    category: 'cultural',
    frequency: 4,
    isUserDefined: false,
    seriesId: 's1',
    chapterId: 'ch2'
  },
  {
    id: 'term6',
    term: 'wizard',
    definition: 'A practitioner of magic and keeper of ancient knowledge',
    translation: 'mago',
    category: 'character',
    frequency: 3,
    isUserDefined: false,
    seriesId: 's1',
    chapterId: 'ch2'
  },
  {
    id: 'term7',
    term: 'tower',
    definition: 'The wizard\'s mystical dwelling place',
    translation: 'torre',
    category: 'place',
    frequency: 2,
    isUserDefined: false,
    seriesId: 's1',
    chapterId: 'ch2'
  },
  // Series 2 terms
  {
    id: 'term8',
    term: 'Ancient Realm',
    definition: 'A mystical world where magic and technology coexist',
    translation: 'Reino Ancestral',
    category: 'place',
    frequency: 1,
    isUserDefined: false,
    seriesId: 's2',
    chapterId: 'ch3'
  }
];

export default mockGlossaryTerms;