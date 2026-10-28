// Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { goalPercent } from '../src/lib/progress.ts';
import { monthLabel, monthSummary, previousMonth } from '../src/lib/recap.ts';

const at = (y, m, d) => new Date(y, m - 1, d, 12).toISOString();

test('monthly recap counts only that month, top 3 by price', () => {
  const items = [
    { name: 'Tumbler', price: 850_000, date: at(2026, 10, 3) },
    { name: 'Sepatu', price: 1_250_000, date: at(2026, 10, 15) },
    { name: 'Hijab', price: 189_000, date: at(2026, 10, 20) },
    { name: 'HP', price: 4_500_000, date: at(2026, 10, 31) },
    { name: 'Tas', price: 450_000, date: at(2026, 9, 30) },
  ];
  const r = monthSummary(items, '2026-10');
  assert.equal(r.total, 6_789_000);
  assert.equal(r.count, 4);
  assert.deepEqual(r.top.map((i) => i.name), ['HP', 'Sepatu', 'Tumbler']);
  assert.equal(monthSummary(items, '2026-09').total, 450_000);
  assert.equal(monthSummary(items, '2026-08').count, 0);
});

test('month names and previous month', () => {
  assert.equal(monthLabel('2026-10'), 'Oktober 2026');
  assert.equal(previousMonth('2026-10'), '2026-09');
  assert.equal(previousMonth('2027-01'), '2026-12');
});

test('goal percent never shows 100% too early', () => {
  assert.equal(goalPercent(2_800_000, 8_000_000), 35);
  assert.equal(goalPercent(7_999_999, 8_000_000), 99);
  assert.equal(goalPercent(9_000_000, 8_000_000), 100);
  assert.equal(goalPercent(100, 0), 0);
});
