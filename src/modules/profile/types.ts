/**
 * Profile Module - Type Definitions
 *
 * Defines all types for user profile and settings functionality
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date | string;
}

export interface ProfileState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

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