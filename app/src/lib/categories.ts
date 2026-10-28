import type { IconName } from '@/components/Icon';

// Item categories for items added without a photo (owner request 2026-10-28).
export const CATEGORIES = [
  { id: 'tumbler', label: 'Tumbler & botol', icon: 'tumbler' },
  { id: 'bag', label: 'Tas', icon: 'bag' },
  { id: 'shoe', label: 'Sepatu', icon: 'shoe' },
  { id: 'shirt', label: 'Baju', icon: 'shirt' },
  { id: 'hijab', label: 'Hijab', icon: 'hijab' },
  { id: 'skincare', label: 'Skincare & makeup', icon: 'skincare' },
  { id: 'phone', label: 'HP & gadget', icon: 'phone' },
  { id: 'audio', label: 'Headphone & elektronik', icon: 'headphones' },
  { id: 'watch', label: 'Jam & aksesoris', icon: 'watch' },
  { id: 'other', label: 'Lainnya', icon: 'other' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const categoryIcon = (id?: string): IconName =>
  CATEGORIES.find((c) => c.id === id)?.icon ?? 'other';
