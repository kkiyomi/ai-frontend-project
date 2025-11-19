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

    // Mock subscription with dynamic features and limits
    const mockSubscription: Subscription = {
      plan: {
        id: "free",
        name: "Free Plan",
        features: {
          translation: false,
          advanced_glossary: false,
          bulk_operations: true,
          export_formats: false,
          collaboration: false,
          priority_support: false,
        },
        limits: {
          series_limit: 1,
          chapter_limit: 200,
          glossary_limit: 250,
          translation_requests_per_day: 50,
          export_count_per_month: 0,
          collaborators_limit: 0,
        }
      },
      usage: {
        series_limit: 0,
        chapter_limit: 0,
        glossary_limit: 0,
        translation_requests_per_day: 12,
        export_count_per_month: 0,
        collaborators_limit: 0,
      }
    };

    return {
      success: true,
      data: mockSubscription,
    };
  }

  async getPlans(): Promise<APIResponse<any[]>> {
    await simulateDelay(200, 400);

    if (simulateFailure()) {
      return {
        success: false,
        error: 'Failed to fetch available plans'
      };
    }

    const mockPlans = [
      {
        id: "free",
        name: "Free Plan",
        price: 0,
        features: {
          translation: false,
          advanced_glossary: false,
          bulk_operations: true,
          export_formats: false,
          collaboration: false,
          priority_support: false,
        },
        limits: {
          series_limit: 1,
          chapter_limit: 200,
          glossary_limit: 250,
          translation_requests_per_day: 50,
          export_count_per_month: 0,
          collaborators_limit: 0,
        }
      },
      {
        id: "pro",
        name: "Pro Plan",
        price: 19.99,
        features: {
          translation: true,
          advanced_glossary: true,
          bulk_operations: true,
          export_formats: true,
          collaboration: false,
          priority_support: true,
        },
        limits: {
          series_limit: 10,
          chapter_limit: 2000,
          glossary_limit: 5000,
          translation_requests_per_day: 1000,
          export_count_per_month: 50,
          collaborators_limit: 0,
        }
      },
      {
        id: "team",
        name: "Team Plan",
        price: 49.99,
        features: {
          translation: true,
          advanced_glossary: true,
          bulk_operations: true,
          export_formats: true,
          collaboration: true,
          priority_support: true,
        },
        limits: {
          series_limit: 50,
          chapter_limit: 10000,
          glossary_limit: 25000,
          translation_requests_per_day: 5000,
          export_count_per_month: 200,
          collaborators_limit: 10,
        }
      }
    ];

    return {
      success: true,
      data: mockPlans,
    };
  }
}