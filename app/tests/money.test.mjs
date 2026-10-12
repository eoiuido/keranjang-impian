// Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyCheckout, monthsBetween, payoffPlan, rollover, rolloverOnce, withInterest } from '../src/lib/money.ts';

test('5% interest, rounded up to Rp100', () => {
  assert.equal(withInterest(300_000), 315_000);
  assert.equal(withInterest(115_000), 120_800); // 120.750 rounds up
  assert.equal(withInterest(100), 200); // 105 rounds up
  assert.equal(withInterest(0), 0);
});

test('months between', () => {
  assert.equal(monthsBetween('2026-10', '2026-10'), 0);
  assert.equal(monthsBetween('2026-10', '2026-11'), 1);
  assert.equal(monthsBetween('2026-10', '2027-01'), 3);
  assert.equal(monthsBetween('2026-10', '2026-09'), 0); // phone clock went back
});

test('spec example: Rp300.000 hutang, Rp200.000 per month', () => {
  const nov = rolloverOnce({ balance: 0, debt: 300_000 }, 200_000);
  assert.deepEqual(nov, { balance: 0, debt: 115_000 });
  const dec = rolloverOnce(nov, 200_000);
  assert.deepEqual(dec, { balance: 79_200, debt: 0 }); // 120.800 paid
});

test('unused balance carries over', () => {
  assert.deepEqual(rollover({ balance: 150_000, debt: 0 }, 1_000_000, 3), { balance: 3_150_000, debt: 0 });
});

test('monthly money of Rp0: debt keeps growing', () => {
  assert.deepEqual(rollover({ balance: 0, debt: 100_000 }, 0, 2), { balance: 0, debt: 110_300 });
});

test('checkout without hutang never goes below Rp0', () => {
  assert.deepEqual(applyCheckout({ balance: 150_000, debt: 0 }, 850_000, false), {
    balance: 0,
    debt: 0,
    hutang: 0,
  });
});

test('checkout with hutang turns the shortfall into debt', () => {
  assert.deepEqual(applyCheckout({ balance: 150_000, debt: 50_000 }, 850_000, true), {
    balance: 0,
    debt: 750_000,
    hutang: 700_000,
  });
});

test('enough balance: hutang adds nothing', () => {
  assert.deepEqual(applyCheckout({ balance: 1_000_000, debt: 0 }, 850_000, true), {
    balance: 150_000,
    debt: 0,
    hutang: 0,
  });
});

test('payoff plan', () => {
  assert.deepEqual(payoffPlan(300_000, 200_000), { months: 2, totalPaid: 320_800 });
  assert.equal(payoffPlan(100_000, 0), null);
  assert.equal(payoffPlan(10_000_000, 400_000), null); // 5% of 10jt = 500rb > 400rb: never
});
