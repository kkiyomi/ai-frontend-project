// src/mock/billing/featureDefinitions.ts
// Shared feature definition constants

import type { FeatureDefinition } from '@/modules/billing/types';

export const customThemesFeature: FeatureDefinition = {
  key: 'custom_themes',
  enabled: true,
  name: '+40 custom themes',
  description: 'Customize the look and feel of the application',
  icon: 'theme',
  category: 'core'
};

export const translationFeature: FeatureDefinition = {
  key: 'translation',
  enabled: true,
  name: 'AI Translation',
  description: 'Automatically translate chapters using AI',
  icon: 'translate',
  category: 'core'
};

export const splitViewFeature: FeatureDefinition = {
  key: 'split_view',
  enabled: true,
  name: 'Split View',
  description: 'Side-by-side editing of original and translated text',
  icon: 'columns',
  category: 'editor'
};

export const fullViewFeature: FeatureDefinition = {
  key: 'full_view',
  enabled: true,
  name: 'Full View',
  description: 'Full-width single column view for focused editing',
  icon: 'maximize',
  category: 'editor'
};

export const paragraphEditingFeature: FeatureDefinition = {
  key: 'paragraph_editing',
  enabled: true,
  name: 'Paragraph Editing',
  description: 'Edit individual paragraphs with precision',
  icon: 'edit',
  category: 'editor'
};

export const glossaryHighlightingFeature: FeatureDefinition = {
  key: 'glossary_highlighting',
  enabled: true,
  name: 'Glossary Highlighting',
  description: 'Automatically highlight glossary terms in text',
  icon: 'highlighter',
  category: 'glossary'
};

export const glossaryCategoriesFeature: FeatureDefinition = {
  key: 'glossary_categories',
  enabled: true,
  name: 'Glossary Categories',
  description: 'Organize glossary terms into categories',
  icon: 'tag',
  category: 'glossary'
};

export const glossaryPopupFeature: FeatureDefinition = {
  key: 'glossary_popup',
  enabled: true,
  name: 'Glossary Tooltips',
  description: 'Show tooltips with definitions when hovering over terms',
  icon: 'message-circle',
  category: 'glossary'
};

export const glossaryImportFeature: FeatureDefinition = {
  key: 'glossary_import',
  enabled: true,
  name: 'Glossary Import',
  description: 'Import glossary terms from CSV files',
  icon: 'upload',
  category: 'import-export'
};

export const draftModeFeature: FeatureDefinition = {
  key: 'draft_mode',
  enabled: true,
  name: 'Draft Mode',
  description: 'Save and manage drafts of your work',
  icon: 'file-text',
  category: 'editor'
};