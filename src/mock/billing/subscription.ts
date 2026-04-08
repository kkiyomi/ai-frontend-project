// src/mock/billing/subscription.ts
// Subscription mock data

import type { Subscription, UsageRecord } from '@/modules/billing/types';
import { mockPlanFree } from './plans';

const now = new Date();
const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

const createUsageRecord = (value: number, periodStart?: Date): UsageRecord => ({
  value,
  lastUpdated: now,
  periodStart,
});

export const mockSubscription: Subscription = {
  plan: mockPlanFree,
  usage: {
    series_limit: createUsageRecord(0),
    chapter_limit: createUsageRecord(0),
    glossary_limit: createUsageRecord(0),
    translation_tokens_limit: createUsageRecord(12, currentPeriodStart),
  },
  topups: [],
  currentPeriod: {
    start: currentPeriodStart,
    end: currentPeriodEnd,
  },
};