import { getCheckoutCount } from './collection';
import { getItem, setItem } from './store';

// Free plan limit (spec.md section 0). The paywall appears on checkout number 4.
export const FREE_CHECKOUTS = 3;

export type PlanId = 'weekly' | 'yearly';

export const PLANS = {
  weekly: { name: 'Mingguan', price: 10_000, period: '7 hari' },
  yearly: { name: 'Tahunan', price: 79_000, offerPrice: 59_000, period: '1 tahun' },
} as const;

// Price for one week of the yearly plan, e.g. Rp79.000 / 52 = Rp1.519.
export const perWeek = (yearly: number) => Math.round(yearly / 52);

// Paid access on this phone. Only our server sets it, after DOKU confirms payment.
export type Access = { plan: PlanId; endsAt: string; email: string };

export const getAccess = () => getItem<Access>('access');

export async function isPaid(): Promise<boolean> {
  const a = await getAccess();
  return !!a && new Date(a.endsAt).getTime() > Date.now();
}

// True when the next fake checkout needs a paid plan.
export async function needsPaywall(): Promise<boolean> {
  const [count, paid] = await Promise.all([getCheckoutCount(), isPaid()]);
  return count >= FREE_CHECKOUTS && !paid;
}

// The decline offer is shown once per phone, ever.
export const declineOfferSeen = async () => (await getItem<boolean>('declineOfferSeen')) === true;
export const markDeclineOfferSeen = () => setItem('declineOfferSeen', true);
