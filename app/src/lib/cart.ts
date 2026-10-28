// The item currently going through the fake checkout.
export type CartItem = {
  name: string;
  price: number;
  photo?: string; // compressed JPEG data URL; missing = category icon
  category?: string; // see lib/categories.ts; decides the icon when there's no photo
  sample: boolean; // true = the built-in example tumbler
};

export const SAMPLE_ITEM: CartItem = { name: 'Tumbler Stainless 1,2L', price: 850_000, category: 'tumbler', sample: true };

export const MIN_PRICE = 1_000;
export const MAX_PRICE = 100_000_000;

export const cart: { item: CartItem | null } = { item: null };
