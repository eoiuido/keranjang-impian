// Savings goal (paid feature, spec.md S13): total saved counts toward something useful.
import type { IconName } from '@/components/Icon';
import { getItem, setItem } from './store';

export const GOAL_TYPES = [
  { id: 'laptop', label: 'Laptop', icon: 'laptop' },
  { id: 'phone', label: 'HP', icon: 'phone' },
  { id: 'travel', label: 'Liburan', icon: 'plane' },
  { id: 'other', label: 'Lainnya', icon: 'target' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

export type GoalTypeId = (typeof GOAL_TYPES)[number]['id'];

export type Goal = { type: GoalTypeId; name: string; target: number };

export const getGoal = async () => (await getItem<Goal | null>('goal')) ?? null;
export const saveGoal = (g: Goal | null) => setItem('goal', g);

export const goalIcon = (type: string): IconName => GOAL_TYPES.find((t) => t.id === type)?.icon ?? 'target';

export { goalPercent } from './progress';
