import type { Subscription, Topup } from './types';

export class LimitCalculator {
  /**
   * Calculate total available for a limit including plan + active topups
   */
  static getTotalAvailable(
    subscription: Subscription,
    limitKey: string
  ): number {
    const planLimit = subscription.plan.limits[limitKey]?.value || 0;
    
    // Add active topups for this limit
    const activeTopups = subscription.topups.filter(
      topup => topup.limitKey === limitKey && 
               topup.isActive && 
               new Date(topup.expiresAt) > new Date()
    );
    
    const topupAmount = activeTopups.reduce(
      (sum, topup) => sum + (topup.amount - topup.usedAmount),
      0
    );
    
    return planLimit + topupAmount;
  }

  /**
   * Calculate current usage for a limit
   */
  static getCurrentUsage(
    subscription: Subscription,
    limitKey: string
  ): number {
    const usageRecord = subscription.usage[limitKey];
    return usageRecord?.value || 0;
  }

  /**
   * Check if a recurring limit is reset for the current period
   */
  static isPeriodResetNeeded(
    subscription: Subscription,
    limitKey: string
  ): boolean {
    const limitDef = subscription.plan.limits[limitKey];
    const usageRecord = subscription.usage[limitKey];
    
    if (limitDef?.type !== 'recurring' || !usageRecord?.periodStart) {
      return false;
    }
    
    const now = new Date();
    const periodStart = new Date(usageRecord.periodStart);
    
    switch (limitDef.resetPeriod) {
      case 'monthly':
        return now.getMonth() !== periodStart.getMonth() ||
               now.getFullYear() !== periodStart.getFullYear();
      case 'yearly':
        return now.getFullYear() !== periodStart.getFullYear();
      default:
        return false;
    }
  }

  /**
   * Get remaining quota for a limit
   */
  static getRemainingQuota(
    subscription: Subscription,
    limitKey: string
  ): number {
    const total = this.getTotalAvailable(subscription, limitKey);
    const used = this.getCurrentUsage(subscription, limitKey);
    return Math.max(0, total - used);
  }

  /**
   * Check if user can consume a certain amount
   */
  static canConsume(
    subscription: Subscription,
    limitKey: string,
    amount: number = 1
  ): boolean {
    return this.getRemainingQuota(subscription, limitKey) >= amount;
  }
}
