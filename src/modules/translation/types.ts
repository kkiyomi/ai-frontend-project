/**
 * Translation Module - Types
 *
 * Domain types for the Translation module.
 */

export interface TranslationState {
  currentChapterId: string | null;
  isTranslating: boolean;
  translationProgress: number;
}

/**
 * Per-chapter translation state, keyed by chapterId in the store.
 * Each chapter gets its own independent state so multiple chapters
 * can be translated concurrently without clobbering each other.
 */
export interface ChapterTranslationState {
  isTranslating: boolean;
  translationProgress: number;
  jobData: TranslationJobResponse | null;
  streamJobData: StreamJobData | null;
  streamingContent: string;
  jobId: string | null;
  activeStreamJobId: string | null;
}

// Add these interfaces to the existing types

export interface TranslationJobResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  errorMessage?: string;
}

// ── Streaming Translation Types ──────────────────────────────────────────

/** Response from POST /translate-chapter-stream */
export interface StreamJobResponse {
  jobId: string;
  streamUrl: string;
  /** True when the chapter was already translated — no job was queued. */
  completed?: boolean;
}

/** SSE event types emitted by the AI translation stream server */
export type StreamEventType =
  | 'connected'
  | 'token'
  | 'chunk_complete'
  | 'progress'
  | 'completed'
  | 'error';

/** Base shape of every parsed SSE event */
export interface StreamEvent {
  event: StreamEventType;
  data: Record<string, unknown>;
}

/** Payload of the `progress` SSE event */
export interface StreamProgressData {
  status: string;
  progress: number;
  message?: string;
}

/** Payload of the `token` SSE event */
export interface StreamTokenData {
  chunk_sequence: number;
  token: string;
}

/** Payload of the `chunk_complete` SSE event */
export interface StreamChunkCompleteData {
  chunk_id: number;
  chunk_sequence: number;
  tl_content: string;
  token_usage?: {
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/** Payload of the `completed` SSE event */
export interface StreamCompletedData {
  job_id: string;
  chapter_id: number;
}

/** Payload of the `error` SSE event */
export interface StreamErrorData {
  job_id: string;
  error: string;
}

/** Internal shape of streaming job state exposed to watchers */
export interface StreamJobData {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  errorMessage?: string;
}
