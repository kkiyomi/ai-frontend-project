import { ref } from 'vue';
import JSZip from 'jszip';
import { exportEngine } from '@/utils/exportEngine';
import type { SeriesWithChapters } from '@/types';
import {
  useGlossaryStore,
  type GlossaryTerm
} from '@/modules/glossary';

export interface ExportOptions {
  filename?: string;
  timestamp?: boolean;
  includeGlossary?: boolean;
}

export interface ExportResult {
  success: boolean;
  error?: string;
  failedChapters?: Array<{ chapterId: string; title: string; error: string }>;
}

export function useExporter() {
  const isExporting = ref(false);
  const error = ref<string | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const downloadZip = async (zipBlob: Blob, filename: string) => {
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchGlossaryForSeries = async (seriesId: string): Promise<GlossaryTerm[]> => {
    const glossary = useGlossaryStore();
    await glossary.loadTerms(seriesId);
    return glossary.getTermsByContext(seriesId);
  };

  const exportSeriesAsZip = async (
    seriesData: SeriesWithChapters[],
    options: ExportOptions = {}
  ): Promise<ExportResult> => {
    isExporting.value = true;
    error.value = null;

    const failedChapters: Array<{ chapterId: string; title: string; error: string }> = [];

    try {
      if (!seriesData || seriesData.length === 0) {
        throw new Error('No series data provided');
      }

      const seriesPromises = seriesData.map(async (series) => {
        const glossaryTerms = options.includeGlossary !== false 
          ? await fetchGlossaryForSeries(series.id)
          : [];

        const { files, failedChapters: chapterFailures } = exportEngine.buildFilesForSeries(series, glossaryTerms, { includeGlossary: options.includeGlossary !== false });
        
        if (chapterFailures.length > 0) {
          failedChapters.push(...chapterFailures.map((f: { chapterId: string; title: string; error: string }) => ({
            chapterId: f.chapterId,
            title: f.title,
            error: f.error,
          })));
        }
        
        return { series, files, glossaryTerms };
      });

      const seriesResults = await Promise.all(seriesPromises);
      
      const zip = new JSZip();
      
      for (const result of seriesResults) {
        const seriesFolder = result.series.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const seriesZip = zip.folder(seriesFolder);
        
        if (!seriesZip) continue;

        for (const file of result.files) {
          seriesZip.file(file.path, file.content);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      let filename = options.filename || 'export';
      if (options.timestamp !== false) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        filename = `${filename}-${timestamp}`;
      }
      filename = `${filename}.zip`;

      await downloadZip(zipBlob, filename);
      
      return {
        success: true,
        failedChapters: failedChapters.length > 0 ? failedChapters : undefined
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during export';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
        failedChapters: failedChapters.length > 0 ? failedChapters : undefined
      };
    } finally {
      isExporting.value = false;
    }
  };

  return {
    isExporting,
    error,
    clearError,
    exportSeriesAsZip,
  };
}