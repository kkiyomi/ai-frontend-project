import { toCSV } from './csvParser';
import type { SeriesWithChapters, Chapter } from '@/types';
import type { GlossaryTerm } from '@/modules/glossary';

export interface ExportFile {
  path: string;
  content: string | Uint8Array;
}

export interface ExportOptions {
  includeGlossary?: boolean;
}

export interface NormalizedSeries {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  chapters: NormalizedChapter[];
  translatedChapters: NormalizedChapter[];
}

export interface NormalizedChapter {
  id: string;
  title: string;
  originalContent: string;
  translatedContent: string;
  seriesId: string;
  order: string;
}

export interface SeriesExportContext {
  series: NormalizedSeries;
  glossaryTerms: GlossaryTerm[];
  options: ExportOptions;
}

const slugify = (text: string) => text
    .toLowerCase()
    .normalize('NFD') // Splits accented characters (e.g., "é" -> "e´")
    .replace(/[\u0300-\u036f]/g, '') // Removes the accents
    .replace(/[^a-z0-9]/g, '-') // Replaces everything else with a hyphen
    .replace(/-+/g, '-') // Collapses multiple hyphens
    .replace(/^-|-$/g, '');

export const exportEngine = {
  normalizeSeries(series: SeriesWithChapters): NormalizedSeries {
    return {
      id: series.id,
      name: series.name,
      description: series.description,
      createdAt: typeof series.createdAt === 'string' 
        ? series.createdAt 
        : series.createdAt.toISOString(),
      chapters: series.chapters
        .map((chapter, index) => ({
          id: chapter.id,
          title: chapter.title,
          originalContent: chapter.content,
          translatedContent: chapter.translatedContent || '[No translation available]',
          seriesId: chapter.seriesId,
          order: (index + 1).toString().padStart(3, '0')
        })),
      translatedChapters: series.chapters
        .filter(chapter => !!chapter.translatedContent)
        .map((chapter, index) => ({
          id: chapter.id,
          title: chapter.title,
          originalContent: chapter.content,
          translatedContent: chapter.translatedContent!,
          seriesId: chapter.seriesId,
          order: (index + 1).toString().padStart(3, '0')
        })),
    };
  },

  filterGlossaryByChapter(glossaryTerms: GlossaryTerm[], chapterId: string): GlossaryTerm[] {
    return glossaryTerms.filter(term => 
      term.chapterId === chapterId || 
      (Array.isArray(term.chapterIds) && term.chapterIds.includes(chapterId))
    );
  },

  buildMetadataFile(series: NormalizedSeries): ExportFile {
    const metadata = {
      series: {
        id: series.id,
        name: series.name,
        description: series.description,
        createdAt: series.createdAt,
        chapterCount: series.chapters.length,
        translatedChapterCount: series.translatedChapters.length,
      },
      exportInfo: {
        exportedAt: new Date().toISOString(),
        format: 'text',
        version: '1.0',
      },
    };

    return {
      path: 'metadata.json',
      content: JSON.stringify(metadata, null, 2),
    };
  },

  buildGlossaryFile(glossaryTerms: GlossaryTerm[], chapter?: NormalizedChapter): ExportFile {
    const filteredTerms = chapter
      ? this.filterGlossaryByChapter(glossaryTerms, chapter.id)
      : glossaryTerms;

    const csvData = filteredTerms.map(term => ({
      term: term.term,
      translation: term.translation,
      definition: term.definition,
      category: term.category,
      chapterId: term.chapterId || '',
    }));

    return {
      path: chapter ? `chapters/${chapter.order}/glossary.csv` : 'glossary.csv',
      content: toCSV(csvData),
    };
  },

  buildChapterTextFile(chapter: NormalizedChapter, includeSource: boolean = true): ExportFile {
    let content = `# ${chapter.title}\n\n${chapter.translatedContent}`;

    if (includeSource && chapter.originalContent) {
      content += `\n\n[--- SOURCE ---]\n\n${chapter.originalContent}`;
    }

    return {
      path: `chapters/${chapter.order}/chapter.txt`,
      content,
    };
  },

  buildTranslatedOnlyChapterTextFiles(normalizedSeries: NormalizedSeries): ExportFile[] {
    return normalizedSeries.translatedChapters.map(chapter => {
      const file = this.buildChapterTextFile(chapter, false);
      return {
        ...file,
        path: `translated/${slugify(chapter.title)}.txt`,
      };
    });
  },

  buildFilesForSeries(
    series: SeriesWithChapters, 
    glossaryTerms: GlossaryTerm[],
    options: ExportOptions = {}
  ): ExportFile[] {
    const normalizedSeries = this.normalizeSeries(series);
    const files: ExportFile[] = [];

    files.push(this.buildMetadataFile(normalizedSeries));

    if (options.includeGlossary !== false && glossaryTerms.length > 0) {
      files.push(this.buildGlossaryFile(glossaryTerms));
    }

    for (const chapter of normalizedSeries.chapters) {
      try {
        files.push(this.buildChapterTextFile(chapter));
        
        if (options.includeGlossary !== false) {
          const chapterGlossary = this.filterGlossaryByChapter(glossaryTerms, chapter.id);
          if (chapterGlossary.length > 0) {
            files.push(this.buildGlossaryFile(glossaryTerms, chapter));
          }
        }
      } catch (error) {
        console.error(`Failed to build files for chapter ${chapter.id} (${chapter.title}):`, error);
      }
    }

    const translatedFiles = this.buildTranslatedOnlyChapterTextFiles(normalizedSeries);
    files.push(...translatedFiles);

    return files;
  },
};