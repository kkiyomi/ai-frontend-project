import type { Subscription } from '../modules/billing/types';

const mockPlanFree = {
  id: "free",
  name: "Free Plan",
  price: 0,
  features: {
    translation: true,
  },
  limits: {
    translation_tokens_limit: 10,
    series_limit: 1,
    chapter_limit: 200,
    glossary_limit: 250,
  }
}

const mockPlanPro = {
  id: "pro",
  name: "Pro Plan",
  price: 19.99,
  features: {
    translation: true,
    export_formats: true,
    collaboration: false,
    priority_support: true,
  },
  limits: {
    translation_tokens_limit: 1000,
    series_limit: 10,
    chapter_limit: 2000,
    glossary_limit: 5000,
  }
}

const mockPlanTeam = {
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
    translation_tokens_limit: 5000,
    series_limit: 50,
    chapter_limit: 10000,
    glossary_limit: 25000,
    export_count_per_month: 200,
    collaborators_limit: 10,
  }
}

export const mockSubscription: Subscription = {
  plan: mockPlanFree,
  usage: {
    series_limit: 0,
    chapter_limit: 0,
    glossary_limit: 0,
    translation_tokens_limit: 12,
  }
};

export const mockPlans = [ mockPlanFree, mockPlanPro, mockPlanTeam ];