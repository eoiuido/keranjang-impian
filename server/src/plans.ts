// Prices live on the server so the browser can never change them (spec.md section 0).
export type PlanId = 'weekly' | 'yearly';

export const PLANS: Record<PlanId, { amount: number; offerAmount?: number; days: number }> = {
  weekly: { amount: 10_000, days: 7 },
  yearly: { amount: 79_000, offerAmount: 59_000, days: 365 },
};

export const isPlan = (p: unknown): p is PlanId => p === 'weekly' || p === 'yearly';
