import type { APIResponse } from '@/modules/core/types';
import type { Subscription } from '../types';

const simulateDelay = (min = 200, max = 800): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const simulateFailure = (failureRate = 0.05): boolean => {
  return Math.random() < failureRate;
};

export class BillingMockAPI {
  async getSubscription(): Promise<APIResponse<Subscription>> {
    await simulateDelay(300, 600);

    if (simulateFailure()) {
      return {
        success: false,
        error: 'Failed to fetch subscription information'
      };
    }

    const mockSubscription: Subscription = {
      plan: {
        id: "free",
        name: "Free",
        features: {
          translation: false
        },
        limits: {
          series_limit: 1,
          chapter_limit: 200,
          glossary_limit: 250
        }
      },
      usage: {
        series_limit: 0,
        chapter_limit: 0,
        glossary_limit: 0
      }
    };

    return {
      success: true,
      data: mockSubscription,
    };
  }
}