import type { Chapter } from '../types';

const mockChapters: Chapter[] = [
  {
    id: 'ch1',
    title: 'Chapter 1: The Beginning',
    content: `The sun rose over the ancient mountains, casting long shadows across the valley below.

In the small village of Elderbrook, life moved at a peaceful pace. The cobblestone streets were lined with quaint houses, their thatched roofs weathered by countless seasons.

Young Aria stepped out of her cottage, breathing in the crisp morning air. Today would be different—she could feel it in her bones.

The old wizard had promised to teach her the ancient arts, but first, she needed to prove herself worthy.`,
    translatedContent: `El sol se alzó sobre las montañas ancestrales, proyectando largas sombras a través del valle.

En el pequeño pueblo de Elderbrook, la vida se movía a un ritmo pacífico. Las calles empedradas estaban bordeadas de casas pintorescas, sus techos de paja desgastados por innumerables estaciones.

La joven Aria salió de su cabaña, respirando el aire fresco de la mañana. Hoy sería diferente, podía sentirlo en sus huesos.

El viejo mago había prometido enseñarle las artes ancestrales, pero primero, necesitaba demostrar que era digna.`,
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
        translatedText: 'En el pequeño pueblo de Elderbrook, la vida se movía a un ritmo pacífico. Las calles empedradas estaban bordeadas de casas pintorescas, sus techos de paja desgastados por innumerables estaciones.',
        isEditing: false,
        chapterId: 'ch1'
      },
      {
        id: 'ch1-p3',
        originalText: 'Young Aria stepped out of her cottage, breathing in the crisp morning air. Today would be different—she could feel it in her bones.',
        translatedText: 'La joven Aria salió de su cabaña, respirando el aire fresco de la mañana. Hoy sería diferente, podía sentirlo en sus huesos.',
        isEditing: false,
        chapterId: 'ch1'
      },
      {
        id: 'ch1-p4',
        originalText: 'The old wizard had promised to teach her the ancient arts, but first, she needed to prove herself worthy.',
        translatedText: 'El viejo mago había prometido enseñarle las artes ancestrales, pero primero, necesitaba demostrar que era digna.',
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
    translatedContent: `La torre del mago se alzaba ante Aria, su arquitectura espiral desafiando la comprensión convencional.

Las runas ancestrales brillaban suavemente a lo largo de las paredes de piedra, pulsando con una energía sobrenatural que hacía que su piel hormigueara.

"Entra, joven buscadora", llegó una voz desde adentro, aunque nadie era visible en la entrada.

Aria respiró profundamente y cruzó el umbral, su destino la esperaba adentro.`,
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
        translatedText: 'Las runas ancestrales brillaban suavemente a lo largo de las paredes de piedra, pulsando con una energía sobrenatural que hacía que su piel hormigueara.',
        isEditing: false,
        chapterId: 'ch2'
      },
      {
        id: 'ch2-p3',
        originalText: '"Enter, young seeker," came a voice from within, though no one was visible at the entrance.',
        translatedText: '"Entra, joven buscadora", llegó una voz desde adentro, aunque nadie era visible en la entrada.',
        isEditing: false,
        chapterId: 'ch2'
      },
      {
        id: 'ch2-p4',
        originalText: 'Aria took a deep breath and crossed the threshold, her destiny awaiting within.',
        translatedText: 'Aria respiró profundamente y cruzó el umbral, su destino la esperaba adentro.',
        isEditing: false,
        chapterId: 'ch2'
      }
    ],
    seriesId: 's1'
  }
];

export default mockChapters;