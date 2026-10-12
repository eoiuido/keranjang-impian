// Money rules from spec.md section 3. Pure functions, no storage, so they are easy to test.

export type Money = { balance: number; debt: number };

// Debt + 5%, rounded up to the nearest Rp100. Integer maths avoids rounding errors.
export function withInterest(debt: number): number {
  return Math.ceil((debt * 105) / 10_000) * 100;
}

// Number of month changes from "2026-10" to "2027-01" (= 3). Never negative.
export function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  return Math.max(0, (ty - fy) * 12 + (tm - fm));
}

// One month change: 1) debt gets 5%, 2) add this month's money, 3) pay debt from balance.
export function rolloverOnce(m: Money, monthly: number): Money {
  let debt = m.debt > 0 ? withInterest(m.debt) : 0;
  let balance = m.balance + Math.max(0, monthly);
  const pay = Math.min(balance, debt);
  balance -= pay;
  debt -= pay;
  return { balance, debt };
}

export function rollover(m: Money, monthly: number, months: number): Money {
  let next = m;
  for (let i = 0; i < months; i++) next = rolloverOnce(next, monthly);
  return next;
}

// A fake checkout. Balance never goes below Rp0; with hutang the shortfall becomes debt.
export function applyCheckout(m: Money, price: number, useHutang: boolean): Money & { hutang: number } {
  const shortfall = Math.max(0, price - m.balance);
  const hutang = useHutang ? shortfall : 0;
  return { balance: Math.max(0, m.balance - price), debt: m.debt + hutang, hutang };
}

// How long a debt takes to pay off from the monthly money, and what it costs in total.
// null = it never gets paid off (monthly money too small), checked up to 10 years.
export function payoffPlan(debt: number, monthly: number): { months: number; totalPaid: number } | null {
  let m: Money = { balance: 0, debt };
  let totalPaid = 0;
  for (let months = 1; months <= 120; months++) {
    const before = withInterest(m.debt);
    m = rolloverOnce(m, monthly);
    totalPaid += before - m.debt;
    if (m.debt === 0) return { months, totalPaid };
  }
  return null;
}
