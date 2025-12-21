/**
 * Limit definitions - human-readable metadata for limits
 * This is separate from plan data to keep API responses lean
 */

export const LIMIT_DEFINITIONS = {
  // Permanent limits (don't reset)
  series_limit: {
    key: 'series_limit',
    type: 'permanent' as const,
    name: 'Series Limit',
    description: 'Maximum number of series you can create',
    unit: 'series',
    icon: 'folder',
    category: 'content'
  },
  chapter_limit: {
    key: 'chapter_limit',
    type: 'permanent' as const,
    name: 'Chapter Limit',
    description: 'Maximum number of chapters you can create',
    unit: 'chapters',
    icon: 'file-text',
    category: 'content'
  },
  glossary_limit: {
    key: 'glossary_limit',
    type: 'permanent' as const,
    name: 'Glossary Limit',
    description: 'Maximum number of glossary terms',
    unit: 'terms',
    icon: 'book',
    category: 'glossary'
  },
  
  // Recurring (monthly) limits
  translation_tokens_limit: {
    key: 'translation_tokens_limit',
    type: 'recurring' as const,
    resetPeriod: 'monthly' as const,
    name: 'Monthly Translation Tokens',
    description: 'AI translation tokens available this month',
    unit: 'tokens',
    icon: 'translate',
    category: 'translation'
  },
  share_views_limit: {
    key: 'share_views_limit',
    type: 'recurring' as const,
    resetPeriod: 'monthly' as const,
    name: 'Monthly Share Views',
    description: 'Maximum number of share views per month',
    unit: 'views',
    icon: 'eye',
    category: 'sharing'
  },
  
  // Topups (one-time purchases)
  translation_tokens_topup: {
    key: 'translation_tokens_topup',
    type: 'topup' as const,
    name: 'Translation Tokens Top-up',
    description: 'Additional AI translation tokens',
    unit: 'tokens',
    icon: 'bolt',
    category: 'translation'
  }
} as const;

export type LimitKey = keyof typeof LIMIT_DEFINITIONS;
