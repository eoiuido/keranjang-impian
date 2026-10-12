import { monthKey } from './format';
import { getItem, setItem } from './store';

export type Profile = {
  money: number; // monthly allowance or salary
  expenses: number; // rough monthly fixed expenses
  startMonth: string; // "2026-10"
};

export type Wallet = {
  balance: number;
  debt: number;
  lastMonth: string; // last month whose money was added
};

// Answers kept between the two onboarding screens.
export const draft = { money: 0, expenses: 1_000_000 };

export const getProfile = () => getItem<Profile>('profile');
export const getWallet = () => getItem<Wallet>('wallet');

// Finish onboarding: save the answers and give this month's balance.
export async function completeOnboarding(money: number, expenses: number): Promise<void> {
  const month = monthKey();
  await setItem<Profile>('profile', { money, expenses, startMonth: month });
  const existing = await getWallet();
  if (!existing) {
    await setItem<Wallet>('wallet', { balance: money - expenses, debt: 0, lastMonth: month });
  }
}
