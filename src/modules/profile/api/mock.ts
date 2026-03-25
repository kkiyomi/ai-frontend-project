/**
 * Profile Module - Mock API Implementation
 *
 * This file provides in-memory mock operations for profile data.
 * Used during development when no real backend is available.
 */

import type { APIResponse } from '@/modules/core';
import type { User } from '../types';

const simulateDelay = (min = 200, max = 500): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

export class ProfileMockAPI {
  async getProfile(): Promise<APIResponse<User>> {
    await simulateDelay();

    const mockUser: User = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: undefined,
      createdAt: new Date('2024-01-15'),
    };

    return {
      success: true,
      data: mockUser,
    };
  }

  async updateProfile(updates: Partial<User>): Promise<APIResponse<User>> {
    await simulateDelay(300, 600);

    // Simulate the updated user
    const updatedUser: User = {
      id: 'user-1',
      name: updates.name || 'John Doe',
      email: updates.email || 'john.doe@example.com',
      avatar: updates.avatar,
      createdAt: new Date('2024-01-15'),
    };

    return {
      success: true,
      data: updatedUser,
    };
  }
}