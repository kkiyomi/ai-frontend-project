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
