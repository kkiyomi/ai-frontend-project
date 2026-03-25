export type FeatureCategory = 'ui' | 'export' | 'sharing' | 'integration' | 'experimental' | 'billing';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: FeatureCategory;
  requiresAuth?: boolean;
  defaultEnv?: 'development' | 'staging' | 'production';
}
