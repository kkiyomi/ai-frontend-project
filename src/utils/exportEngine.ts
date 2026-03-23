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
}

export interface NormalizedChapter {
  id: string;
  title: string;
  translatedContent: string;
  seriesId: string;
  order: number;
}

export interface SeriesExportContext {
  series: NormalizedSeries;
  glossaryTerms: GlossaryTerm[];
  options: ExportOptions;
}

export const exportEngine = {
  normalizeSeries(series: SeriesWithChapters, showOnlyTranslated: boolean = false): NormalizedSeries {
    return {
      id: series.id,
      name: series.name,
      description: series.description,
      createdAt: typeof series.createdAt === 'string' 
        ? series.createdAt 
        : series.createdAt.toISOString(),
      chapters: series.chapters
        .filter(chapter => {
          return showOnlyTranslated ? !!chapter.translatedContent : true;
        })
        .map((chapter, index) => ({
          id: chapter.id,
          title: chapter.title,
          originalContent: chapter.content,
          translatedContent: chapter.translatedContent || '[No translation available]',
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

  buildFilesForSeries(
    series: SeriesWithChapters, 
    glossaryTerms: GlossaryTerm[],
    options: ExportOptions = {}
  ): { files: ExportFile[]; failedChapters: Array<{ chapterId: string; title: string; error: string }> } {
    const normalizedSeries = this.normalizeSeries(series);
    const files: ExportFile[] = [];
    const failedChapters: Array<{ chapterId: string; title: string; error: string }> = [];

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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failedChapters.push({
          chapterId: chapter.id,
          title: chapter.title,
          error: errorMessage,
        });
        console.warn(`Failed to build files for chapter ${chapter.id}:`, error);
      }
    }

    return { files, failedChapters };
  },
};