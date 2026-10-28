import { monthKey } from './format';
import { monthsBetween, rollover } from './money';
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

// The wallet, brought up to this month first: for every month change since the
// last visit, debt gets 5%, the month's money is added and debt is paid from it.
export async function loadWallet(): Promise<Wallet | undefined> {
  const [wallet, profile] = await Promise.all([getItem<Wallet>('wallet'), getProfile()]);
  if (!wallet || !profile) return wallet;
  const now = monthKey();
  const months = monthsBetween(wallet.lastMonth, now);
  if (months === 0) return wallet;
  const next: Wallet = { ...rollover(wallet, profile.money - profile.expenses, months), lastMonth: now };
  await setItem('wallet', next);
  return next;
}

export const saveWallet = (w: Wallet) => setItem('wallet', w);

// Finish onboarding: save the answers and give this month's balance.
export async function completeOnboarding(money: number, expenses: number): Promise<void> {
  const month = monthKey();
  await setItem<Profile>('profile', { money, expenses, startMonth: month });
  const existing = await getItem<Wallet>('wallet');
  if (!existing) {
    await setItem<Wallet>('wallet', { balance: money - expenses, debt: 0, lastMonth: month });
  }
}

// Settings: new monthly money/expenses apply from the next month change (this month's balance stays).
export async function updateProfile(money: number, expenses: number): Promise<void> {
  const p = await getProfile();
  await setItem<Profile>('profile', { money, expenses, startMonth: p?.startMonth ?? monthKey() });
}
