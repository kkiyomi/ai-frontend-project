import type { APIResponse } from '@/modules/core/types';
import type { Subscription, Plan } from '../types';
import { mockSubscription, mockPlans } from '@/mock/billing';

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


    return {
      success: true,
      data: mockSubscription,
    };
  }

  async getPlans(): Promise<APIResponse<Plan[]>> {
    await simulateDelay(200, 400);

    if (simulateFailure()) {
      return {
        success: false,
        error: 'Failed to fetch available plans'
      };
    }


    return {
      success: true,
      data: mockPlans,
    };
  }
}
