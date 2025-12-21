import type { Subscription } from '../modules/billing/types';

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
    translation_tokens_limit: 10,
    series_limit: 1,
    chapter_limit: 200,
    glossary_limit: 250,
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
    translation_tokens_limit: 1000,
    series_limit: 10,
    chapter_limit: 2000,
    glossary_limit: 5000,
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
    translation_tokens_limit: 5000,
    series_limit: 50,
    chapter_limit: 10000,
    glossary_limit: 25000,
    export_count_per_month: 200,
    collaborators_limit: 10,
  }
};

export const mockSubscription: Subscription = {
  plan: mockPlanFree,
  usage: {
    series_limit: 0,
    chapter_limit: 0,
    glossary_limit: 0,
    translation_tokens_limit: 12,
  }
};

export const mockPlans = [ mockPlanFree, mockPlanPro, mockPlanTeam ];
