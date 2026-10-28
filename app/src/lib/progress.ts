// Pure maths for the savings goal (kept apart so tests can load it without phone storage).
// 0–100, rounded down so it only says 100% when the goal is really reached.
export function goalPercent(saved: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.floor((saved / target) * 100));
}
