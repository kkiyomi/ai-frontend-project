import type { FeatureFlag } from './types';

export const defaultFeatureFlags: Record<string, FeatureFlag> = {
  export_button: {
    id: 'export_button',
    name: 'Export Button',
    description: 'Show export functionality in the UI',
    enabled: import.meta.env.VITE_FEATURE_EXPORT !== 'false',
    category: 'export',
    defaultEnv: 'development'
  },
  sharing_button: {
    id: 'sharing_button',
    name: 'Sharing Button',
    description: 'Enable content sharing features',
    enabled: import.meta.env.VITE_FEATURE_SHARING !== 'false',
    category: 'sharing',
    requiresAuth: true,
    defaultEnv: 'development'
  },
  ai_suggestions: {
    id: 'ai_suggestions',
    name: 'AI Suggestions',
    description: 'Enable AI-powered translation suggestions',
    enabled: import.meta.env.VITE_FEATURE_AI_SUGGESTIONS === 'true',
    category: 'experimental',
    defaultEnv: 'development'
  },
  google_drive: {
    id: 'google_drive',
    name: 'Google Drive Integration',
    description: 'Import/export from Google Drive',
    enabled: import.meta.env.VITE_FEATURE_GOOGLE_DRIVE === 'true',
    category: 'integration',
    requiresAuth: true,
    defaultEnv: 'staging'
  },
  advanced_billing: {
    id: 'advanced_billing',
    name: 'Advanced Billing',
    description: 'Show advanced billing options and analytics',
    enabled: import.meta.env.VITE_FEATURE_ADVANCED_BILLING !== 'false',
    category: 'billing',
    defaultEnv: 'production'
  }
};
