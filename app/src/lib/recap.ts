// Monthly recap (paid feature, spec.md S15): what was "not bought" in a calendar month.
// Pure functions so they are easy to test. Never includes income or address.

export type RecapItem = { name: string; price: number; date: string };

export type Recap = { month: string; total: number; count: number; top: RecapItem[] };

// "2026-10" for a date, in the phone's local time.
export function monthOf(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// The month before "2026-01" is "2025-12".
export function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}

export function monthSummary(items: RecapItem[], month: string): Recap {
  const inMonth = items.filter((i) => monthOf(i.date) === month);
  return {
    month,
    total: inMonth.reduce((s, i) => s + i.price, 0),
    count: inMonth.length,
    top: [...inMonth].sort((a, b) => b.price - a.price).slice(0, 3),
  };
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// "Oktober 2026"
export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
