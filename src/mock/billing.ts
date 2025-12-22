import type { Subscription, Usage, Topup } from '../modules/billing/types';

const now = new Date();
const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

const createUsageRecord = (value: number, periodStart?: Date) => ({
  value,
  lastUpdated: now,
  periodStart,
});

const createLimitDef = (
  key: string,
  type: 'permanent' | 'recurring' | 'topup',
  value: number,
  name: string,
  description?: string,
  unit?: string,
  icon?: string,
  category?: string,
  resetPeriod?: 'monthly' | 'yearly' | 'custom',
  expiresAt?: Date
) => ({
  key,
  type,
  value,
  name,
  description,
  unit,
  icon,
  category,
  resetPeriod,
  expiresAt,
});

const mockPlanFree = {
  id: "free",
  name: "Free Plan",
  price: 0,
  features: {
    translation: {
      key: 'translation',
      enabled: true,
      name: 'AI Translation',
      description: 'Automatically translate chapters using AI',
      icon: 'translate',
      category: 'core'
    },
  },
  limits: {
    translation_tokens_limit: createLimitDef(
      'translation_tokens_limit',
      'recurring',
      10,
      'Monthly Translation Tokens',
      'AI translation tokens available this month',
      'tokens',
      'translate',
      'translation',
      'monthly'
    ),
    series_limit: createLimitDef(
      'series_limit',
      'permanent',
      1,
      'Series Limit',
      'Maximum number of series you can create',
      'series',
      'folder',
      'content'
    ),
    chapter_limit: createLimitDef(
      'chapter_limit',
      'permanent',
      200,
      'Chapter Limit',
      'Maximum number of chapters you can create',
      'chapters',
      'file-text',
      'content'
    ),
    glossary_limit: createLimitDef(
      'glossary_limit',
      'permanent',
      250,
      'Glossary Limit',
      'Maximum number of glossary terms',
      'terms',
      'book',
      'glossary'
    ),
  }
};

const mockPlanPro = {
  id: "pro",
  name: "Pro Plan",
  price: 19.99,
  features: {
    translation: {
      key: 'translation',
      enabled: true,
      name: 'AI Translation',
      description: 'Automatically translate chapters using AI',
      icon: 'translate',
      category: 'core'
    },
    export_formats: {
      key: 'export_formats',
      enabled: true,
      name: 'Export Formats',
      description: 'Export to PDF, EPUB, and DOCX formats',
      icon: 'download',
      category: 'export'
    },
    collaboration: {
      key: 'collaboration',
      enabled: false,
      name: 'Collaboration',
      description: 'Share projects and work together in real-time',
      icon: 'users',
      category: 'collaboration'
    },
    priority_support: {
      key: 'priority_support',
      enabled: true,
      name: 'Priority Support',
      description: 'Get fast responses from our support team',
      icon: 'support',
      category: 'support'
    },
  },
  limits: {
    translation_tokens_limit: createLimitDef(
      'translation_tokens_limit',
      'recurring',
      1000,
      'Monthly Translation Tokens',
      'AI translation tokens available this month',
      'tokens',
      'translate',
      'translation',
      'monthly'
    ),
    series_limit: createLimitDef(
      'series_limit',
      'permanent',
      10,
      'Series Limit',
      'Maximum number of series you can create',
      'series',
      'folder',
      'content'
    ),
    chapter_limit: createLimitDef(
      'chapter_limit',
      'permanent',
      2000,
      'Chapter Limit',
      'Maximum number of chapters you can create',
      'chapters',
      'file-text',
      'content'
    ),
    glossary_limit: createLimitDef(
      'glossary_limit',
      'permanent',
      5000,
      'Glossary Limit',
      'Maximum number of glossary terms',
      'terms',
      'book',
      'glossary'
    ),
  }
};

const mockPlanTeam = {
  id: "team",
  name: "Team Plan",
  price: 49.99,
  features: {
    translation: {
      key: 'translation',
      enabled: true,
      name: 'AI Translation',
      description: 'Automatically translate chapters using AI',
      icon: 'translate',
      category: 'core'
    },
    advanced_glossary: {
      key: 'advanced_glossary',
      enabled: true,
      name: 'Advanced Glossary',
      description: 'Custom glossary with term frequency and suggestions',
      icon: 'book-open',
      category: 'glossary'
    },
    bulk_operations: {
      key: 'bulk_operations',
      enabled: true,
      name: 'Bulk Operations',
      description: 'Import, export, and update multiple items at once',
      icon: 'layers',
      category: 'productivity'
    },
    export_formats: {
      key: 'export_formats',
      enabled: true,
      name: 'Export Formats',
      description: 'Export to PDF, EPUB, and DOCX formats',
      icon: 'download',
      category: 'export'
    },
    collaboration: {
      key: 'collaboration',
      enabled: true,
      name: 'Collaboration',
      description: 'Share projects and work together in real-time',
      icon: 'users',
      category: 'collaboration'
    },
    priority_support: {
      key: 'priority_support',
      enabled: true,
      name: 'Priority Support',
      description: 'Get fast responses from our support team',
      icon: 'support',
      category: 'support'
    },
  },
  limits: {
    translation_tokens_limit: createLimitDef(
      'translation_tokens_limit',
      'recurring',
      5000,
      'Monthly Translation Tokens',
      'AI translation tokens available this month',
      'tokens',
      'translate',
      'translation',
      'monthly'
    ),
    series_limit: createLimitDef(
      'series_limit',
      'permanent',
      50,
      'Series Limit',
      'Maximum number of series you can create',
      'series',
      'folder',
      'content'
    ),
    chapter_limit: createLimitDef(
      'chapter_limit',
      'permanent',
      10000,
      'Chapter Limit',
      'Maximum number of chapters you can create',
      'chapters',
      'file-text',
      'content'
    ),
    glossary_limit: createLimitDef(
      'glossary_limit',
      'permanent',
      25000,
      'Glossary Limit',
      'Maximum number of glossary terms',
      'terms',
      'book',
      'glossary'
    ),
    export_count_per_month: createLimitDef(
      'export_count_per_month',
      'recurring',
      200,
      'Monthly Exports',
      'Number of exports allowed per month',
      'exports',
      'download',
      'export',
      'monthly'
    ),
    collaborators_limit: createLimitDef(
      'collaborators_limit',
      'permanent',
      10,
      'Collaborators Limit',
      'Maximum number of collaborators',
      'collaborators',
      'users',
      'collaboration'
    ),
  }
};

export const mockSubscription: Subscription = {
  plan: mockPlanFree,
  usage: {
    series_limit: createUsageRecord(0),
    chapter_limit: createUsageRecord(0),
    glossary_limit: createUsageRecord(0),
    translation_tokens_limit: createUsageRecord(12, currentPeriodStart),
  },
  topups: [],
  currentPeriod: {
    start: currentPeriodStart,
    end: currentPeriodEnd,
  },
};

export const mockPlans = [ mockPlanFree, mockPlanPro, mockPlanTeam ];
