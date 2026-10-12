// Indonesian number format: Rp1.500.000 (point for thousands).
const idr = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

export function rupiah(n: number): string {
  return 'Rp' + idr.format(Math.round(n));
}

// "2026-10" for the calendar month of a date.
export function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
