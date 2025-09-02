import type { Chapter } from '../types';

const mockChapters: Chapter[] = [
  {
    id: 'ch1',
    title: 'Chapter 1: The Beginning',
    content: `The sun rose over the ancient mountains, casting long shadows across the valley below.

In the small village of Elderbrook, life moved at a peaceful pace. The cobblestone streets were lined with quaint houses, their thatched roofs weathered by countless seasons.

Young Aria stepped out of her cottage, breathing in the crisp morning air. Today would be different—she could feel it in her bones.

The old wizard had promised to teach her the ancient arts, but first, she needed to prove herself worthy.`,
    paragraphs: [
      {
        id: 'ch1-p1',
        originalText: 'The sun rose over the ancient mountains, casting long shadows across the valley below.',
        translatedText: 'El sol se alzó sobre las montañas ancestrales, proyectando largas sombras a través del valle.',
        isEditing: false,
        chapterId: 'ch1'
      },
      {
        id: 'ch1-p2',
        originalText: 'In the small village of Elderbrook, life moved at a peaceful pace. The cobblestone streets were lined with quaint houses, their thatched roofs weathered by countless seasons.',
        translatedText: '',
        isEditing: false,
        chapterId: 'ch1'
      },
      {
        id: 'ch1-p3',
        originalText: 'Young Aria stepped out of her cottage, breathing in the crisp morning air. Today would be different—she could feel it in her bones.',
        translatedText: '',
        isEditing: false,
        chapterId: 'ch1'
      },
      {
        id: 'ch1-p4',
        originalText: 'The old wizard had promised to teach her the ancient arts, but first, she needed to prove herself worthy.',
        translatedText: '',
        isEditing: false,
        chapterId: 'ch1'
      }
    ],
    seriesId: 's1'
  },
  {
    id: 'ch2',
    title: 'Chapter 2: The Test',
    content: `The wizard's tower loomed before Aria, its spiraling architecture defying conventional understanding.

Ancient runes glowed softly along the stone walls, pulsing with an otherworldly energy that made her skin tingle.

"Enter, young seeker," came a voice from within, though no one was visible at the entrance.

Aria took a deep breath and crossed the threshold, her destiny awaiting within.`,
    paragraphs: [
      {
        id: 'ch2-p1',
        originalText: 'The wizard\'s tower loomed before Aria, its spiraling architecture defying conventional understanding.',
        translatedText: 'La torre del mago se alzaba ante Aria, su arquitectura espiral desafiando la comprensión convencional.',
        isEditing: false,
        chapterId: 'ch2'
      },
      {
        id: 'ch2-p2',
        originalText: 'Ancient runes glowed softly along the stone walls, pulsing with an otherworldly energy that made her skin tingle.',
        translatedText: '',
        isEditing: false,
        chapterId: 'ch2'
      },
      {
        id: 'ch2-p3',
        originalText: '"Enter, young seeker," came a voice from within, though no one was visible at the entrance.',
        translatedText: '',
        isEditing: false,
        chapterId: 'ch2'
      },
      {
        id: 'ch2-p4',
        originalText: 'Aria took a deep breath and crossed the threshold, her destiny awaiting within.',
        translatedText: '',
        isEditing: false,
        chapterId: 'ch2'
      }
    ],
    seriesId: 's1'
  }
];

export default mockChapters;