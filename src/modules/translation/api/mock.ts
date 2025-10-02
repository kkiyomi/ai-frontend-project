/**
 * Translation Module - Mock API Implementation
 *
 * Provides mock translation responses for development and testing.
 * Simulates realistic network delays and occasional failures.
 *
 * IMPORTANT: This is feature-specific mock logic that belongs to Translation module,
 * NOT in Core infrastructure.
 */

import type { APIResponse } from '@/modules/core';

const simulateDelay = (min = 300, max = 1000): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const simulateFailure = (failureRate = 0.05): boolean => {
  return Math.random() < failureRate;
};

export class TranslationMockAPI {
  async translateText(
    text: string,
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> {
    await simulateDelay();

    if (simulateFailure()) {
      return {
        success: false,
        error: 'Translation service temporarily unavailable'
      };
    }

    const contextNote = glossaryContext && glossaryContext.length > 0
      ? ` (applying glossary: ${glossaryContext.join(', ')})`
      : '';

    return {
      success: true,
      data: `[Mock Translation]${contextNote} ${text}`,
    };
  }

  async translateParagraph(
    text: string,
    chapterId: string,
    paragraphIndex: number,
    glossaryContext?: string[]
  ): Promise<APIResponse<string>> {
    await simulateDelay(400, 900);

    if (simulateFailure(0.03)) {
      return {
        success: false,
        error: 'Paragraph translation failed'
      };
    }

    const contextNote = glossaryContext && glossaryContext.length > 0
      ? ` (applying glossary: ${glossaryContext.join(', ')})`
      : '';

    return {
      success: true,
      data: `[Mock Translation - Ch:${chapterId}, P:${paragraphIndex}]${contextNote} ${text}`,
    };
  }

  async retranslateWithGlossary(
    originalText: string,
    currentTranslation: string,
    glossaryTerms: string[]
  ): Promise<APIResponse<string>> {
    await simulateDelay(600, 1200);

    if (simulateFailure(0.02)) {
      return {
        success: false,
        error: 'Retranslation failed'
      };
    }

    return {
      success: true,
      data: `[Mock Retranslation with: ${glossaryTerms.join(', ')}] ${originalText}`,
    };
  }

  async suggestGlossaryTerms(text: string): Promise<APIResponse<string[]>> {
    await simulateDelay(400, 800);

    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const frequency: Record<string, number> = {};

    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const suggestions = Object.entries(frequency)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([word, _]) => word);

    return {
      success: true,
      data: suggestions,
    };
  }
}
