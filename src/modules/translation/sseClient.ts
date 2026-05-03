/**
 * Translation Module - SSE Client
 *
 * Lightweight SSE (Server-Sent Events) client using fetch + ReadableStream.
 * Supports custom headers (needed for stream auth token) and AbortController
 * for proper cleanup — unlike the native EventSource API.
 *
 * Usage:
 * ```typescript
 * const stream = createSSEStream(streamUrl, {
 *   onProgress: (data) => updateProgress(data.progress),
 *   onCompleted: () => refreshChapter(),
 *   onError: (err) => showError(err),
 * });
 *
 * // Later, to cancel:
 * stream.abort();
 * ```
 */

import type { StreamEvent, StreamEventType } from './types';

export interface SSEStreamCallbacks {
  onConnected?: (data: Record<string, unknown>) => void;
  onToken?: (data: Record<string, unknown>) => void;
  onChunkComplete?: (data: Record<string, unknown>) => void;
  onProgress?: (data: Record<string, unknown>) => void;
  onCompleted?: (data: Record<string, unknown>) => void;
  onError?: (data: Record<string, unknown>) => void;
  onClose?: () => void;
}

export interface SSEStreamHandle {
  /** Abort the SSE connection */
  abort: () => void;
  /** Whether the connection is still active */
  readonly active: boolean;
}

/**
 * Parses a single SSE chunk from the stream buffer.
 * Returns parsed events and the remaining unprocessed buffer.
 */
function parseSSEBuffer(buffer: string): { events: StreamEvent[]; remainder: string } {
  const events: StreamEvent[] = [];
  // Split on double newline (event boundary in SSE)
  const parts = buffer.split('\n\n');

  // The last part is always the incomplete remainder
  const complete = parts.slice(0, -1);
  const remainder = parts[parts.length - 1] || '';

  for (const block of complete) {
    const lines = block.split('\n');
    let eventType: StreamEventType = 'message' as StreamEventType;
    let dataRaw = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim() as StreamEventType;
      } else if (line.startsWith('data: ')) {
        dataRaw = line.slice(6);
      }
    }

    if (dataRaw) {
      try {
        events.push({ event: eventType, data: JSON.parse(dataRaw) as Record<string, unknown> });
      } catch {
        // If JSON parse fails, pass raw string wrapped in an object
        events.push({ event: eventType, data: { raw: dataRaw } });
      }
    }
  }

  return { events, remainder };
}

/**
 * Open an SSE connection to the given URL using fetch with ReadableStream.
 *
 * @param url  - The SSE endpoint URL
 * @param callbacks - Event handlers
 * @param options - Optional auth headers and signal
 *
 * ── Logging ──
 * All lifecycle events are logged with the [SSE] prefix.
 * Set localStorage.debug='sse' to enable verbose event traces in devtools.
 */
export function connectSSE(
  url: string,
  callbacks: SSEStreamCallbacks,
  options?: { authorization?: string; signal?: AbortSignal },
): SSEStreamHandle {
  const controller = new AbortController();
  let isActive = true;
  let eventCount = 0;

  const log = (msg: string, ...args: unknown[]) =>
    console.debug(`[SSE] ${msg}`, ...args);

  const handle: SSEStreamHandle = {
    abort: () => {
      log('abort() called — closing stream');
      isActive = false;
      controller.abort();
      callbacks.onClose?.();
    },
    get active() {
      return isActive;
    },
  };

  // Combine external signal with internal controller
  const signal = options?.signal
    ? combineAbortSignals(options.signal, controller.signal)
    : controller.signal;

  (async () => {
    try {
      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      };

      if (options?.authorization) {
        headers['Authorization'] = `Bearer ${options.authorization}`;
      }

      log('fetching %s (auth=%s)', url, !!options?.authorization);
      const response = await fetch(url, { headers, signal });
      log('response status=%d %s', response.status, response.statusText);

      if (!response.ok) {
        const errData = await response.text().catch(() => '');
        log('non-OK response, body=%s', errData);
        callbacks.onError?.({ error: `SSE request failed: ${response.status}`, detail: errData });
        isActive = false;
        callbacks.onClose?.();
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        log('response.body is null — cannot read stream');
        callbacks.onError?.({ error: 'Response body is not readable' });
        isActive = false;
        callbacks.onClose?.();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          log('stream closed by server (done=true)');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const { events, remainder } = parseSSEBuffer(buffer);
        buffer = remainder;

        for (const evt of events) {
          eventCount++;
          log('event #%d: %s %o', eventCount, evt.event, evt.data);

          switch (evt.event) {
            case 'connected':
              callbacks.onConnected?.(evt.data);
              break;
            case 'token':
              callbacks.onToken?.(evt.data);
              break;
            case 'chunk_complete':
              callbacks.onChunkComplete?.(evt.data);
              break;
            case 'progress':
              callbacks.onProgress?.(evt.data);
              break;
            case 'completed':
              callbacks.onCompleted?.(evt.data);
              break;
            case 'error':
              callbacks.onError?.(evt.data);
              break;
          }
        }
      }

      log('read loop ended, total events=%d', eventCount);
      isActive = false;
      callbacks.onClose?.();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        log('intentional abort (AbortError)');
        return;
      }
      isActive = false;
      const message = err instanceof Error ? err.message : 'Unknown SSE error';
      log('unexpected error: %s', message);
      callbacks.onError?.({ error: message });
      callbacks.onClose?.();
    }
  })();

  return handle;
}

/**
 * Combine two AbortSignals into one. If either aborts, the combined signal aborts.
 */
function combineAbortSignals(s1: AbortSignal, s2: AbortSignal): AbortSignal {
  const controller = new AbortController();

  const onAbort = () => controller.abort();
  s1.addEventListener('abort', onAbort);
  s2.addEventListener('abort', onAbort);

  // Clean up listeners when the combined signal fires
  controller.signal.addEventListener('abort', () => {
    s1.removeEventListener('abort', onAbort);
    s2.removeEventListener('abort', onAbort);
  });

  // If either signal is already aborted, abort immediately
  if (s1.aborted || s2.aborted) {
    controller.abort();
  }

  return controller.signal;
}
