/**
 * Core Module - Settings System Types
 *
 * Centralized settings system that can be used by all modules.
 * Provides a consistent interface for registering and managing settings.
 */

export interface SettingsItem {
  id: string;
  type: 'toggle' | 'select' | 'input' | 'custom';
  label: string;
  description?: string;
  value: any;
  options?: Array<{ label: string; value: any }>;
  component?: any; // For custom components
}

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  items: SettingsItem[];
  component?: any; // For completely custom section components
}