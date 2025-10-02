import type { Chapter } from './types';
import type { APIResponse } from '@/modules/core';

/**
 * Splits text into trimmed non-empty paragraphs
 */
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\r?\n+/)
    .map(p => p.trim())
    .filter(Boolean);
}

/**
 * Enrich a Chapter with paragraph arrays from content and translatedContent
 */
function enrichChapter(chapter: Chapter): Chapter {
  return {
    ...chapter,
    originalParagraphs: splitIntoParagraphs(chapter.content),
    translatedParagraphs: splitIntoParagraphs(chapter.translatedContent),
  };
}

/**
 * Class decorator that automatically enriches any method
 * returning APIResponse<Chapter> or APIResponse<Chapter[]>
 */
export function AutoEnrichChapters<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);

      for (const key of Object.getOwnPropertyNames(constructor.prototype)) {
        if (key === "constructor") continue;

        const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, key);
        if (!descriptor || typeof descriptor.value !== "function") continue;

        const original = descriptor.value;

        Object.defineProperty(this, key, {
          ...descriptor,
          value: async (...methodArgs: any[]) => {
            const response = await original.apply(this, methodArgs);

            // Only process APIResponse<Chapter | Chapter[]>
            if (response && "data" in response) {
              const data = response.data;

              if (Array.isArray(data)) {
                return { ...response, data: (data as Chapter[]).map(enrichChapter) };
              }

              if (data && typeof (data as Chapter).content === "string") {
                return { ...response, data: enrichChapter(data as Chapter) };
              }
            }

            return response;
          },
        });
      }
    }
  };
}
