import type { GlossaryTerm } from '../types';

const mockGlossaryTerms: GlossaryTerm[] = [
  {
    id: 'term1',
    term: 'Elderbrook',
    definition: 'A small, peaceful village nestled in the valley',
    translation: 'Arroyo del Anciano',
    category: 'place',
    frequency: 3,
    isUserDefined: false
  },
  {
    id: 'term2',
    term: 'Aria',
    definition: 'The young protagonist of our story',
    translation: 'Aria',
    category: 'character',
    frequency: 8,
    isUserDefined: false
  },
  {
    id: 'term3',
    term: 'ancient arts',
    definition: 'Magical practices passed down through generations',
    translation: 'artes ancestrales',
    category: 'cultural',
    frequency: 2,
    isUserDefined: false
  },
  {
    id: 'term4',
    term: 'wizard',
    definition: 'A practitioner of magic and keeper of ancient knowledge',
    translation: 'mago',
    category: 'character',
    frequency: 5,
    isUserDefined: false
  },
  {
    id: 'term5',
    term: 'runes',
    definition: 'Ancient magical symbols with mystical properties',
    translation: 'runas',
    category: 'cultural',
    frequency: 4,
    isUserDefined: false
  }
];

export default mockGlossaryTerms;