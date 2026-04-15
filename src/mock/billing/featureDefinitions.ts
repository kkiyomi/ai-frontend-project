// src/mock/billing/featureDefinitions.ts
// Shared feature definition constants

import type { FeatureDefinition } from '@/modules/billing/types';

export const customThemesFeature: FeatureDefinition = {
  key: 'custom_themes',
  enabled: true,
  name: '40 custom themes',
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

export const collaborationFeature: FeatureDefinition = {
  key: 'collaboration',
  enabled: false,
  name: 'Collaboration',
  description: 'Share projects and work together in real-time',
  icon: 'users',
  category: 'collaboration'
};

export const prioritySupportFeature: FeatureDefinition = {
  key: 'priority_support',
  enabled: true,
  name: 'Priority Support',
  description: 'Get fast responses from our support team',
  icon: 'support',
  category: 'support'
};

export const advancedGlossaryFeature: FeatureDefinition = {
  key: 'advanced_glossary',
  enabled: true,
  name: 'Advanced Glossary',
  description: 'Custom glossary with term frequency and suggestions',
  icon: 'book-open',
  category: 'glossary'
};

export const bulkOperationsFeature: FeatureDefinition = {
  key: 'bulk_operations',
  enabled: true,
  name: 'Bulk Operations',
  description: 'Import, export, and update multiple items at once',
  icon: 'layers',
  category: 'productivity'
};

export const exportFormatsFeature: FeatureDefinition = {
  key: 'export_formats',
  enabled: true,
  name: 'Export Formats',
  description: 'Export to PDF, EPUB, and DOCX formats',
  icon: 'download',
  category: 'export'
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

export const contentFilteringFeature: FeatureDefinition = {
  key: 'content_filtering',
  enabled: true,
  name: 'Content Filtering',
  description: 'Filter content between all text and translated only',
  icon: 'filter',
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

export const glossarySuggestionsFeature: FeatureDefinition = {
  key: 'glossary_suggestions',
  enabled: true,
  name: 'Glossary Suggestions',
  description: 'Get smart term suggestions from text content',
  icon: 'lightbulb',
  category: 'glossary'
};

export const fileImportFeature: FeatureDefinition = {
  key: 'file_import',
  enabled: true,
  name: 'File Import',
  description: 'Import series and chapters from various file formats',
  icon: 'file-up',
  category: 'import-export'
};

export const virtualScrollingFeature: FeatureDefinition = {
  key: 'virtual_scrolling',
  enabled: true,
  name: 'Virtual Scrolling',
  description: 'Smooth performance for large lists and content',
  icon: 'move-vertical',
  category: 'performance'
};

export const settingsFeature: FeatureDefinition = {
  key: 'settings',
  enabled: true,
  name: 'Settings',
  description: 'Customize user preferences and application behavior',
  icon: 'settings',
  category: 'core'
};

export const autoSaveFeature: FeatureDefinition = {
  key: 'auto_save',
  enabled: true,
  name: 'Auto Save',
  description: 'Automatically save changes as you work',
  icon: 'save',
  category: 'editor'
};

export const draftModeFeature: FeatureDefinition = {
  key: 'draft_mode',
  enabled: true,
  name: 'Draft Mode',
  description: 'Save and manage drafts of your work',
  icon: 'file-text',
  category: 'editor'
};