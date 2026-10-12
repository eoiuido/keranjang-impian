import type { CartItem } from './cart';
import { getWallet, type Wallet } from './profile';
import { getItem, setItem } from './store';

export type SavedItem = CartItem & {
  id: string;
  date: string; // ISO time of the fake checkout
  method: string; // fake payment method chosen
  hutang: number; // fake debt taken for this item (0 if none)
};

export type CheckoutResult = { item: SavedItem; before: number; after: number; count: number };

export const getItems = async () => (await getItem<SavedItem[]>('items')) ?? [];
export const getCheckoutCount = async () => (await getItem<number>('checkoutsUsed')) ?? 0;
export const getAddress = async () => (await getItem<string>('address')) ?? '';
export const saveAddress = (a: string) => setItem('address', a); // phone only, never uploaded

// Shown by the success screen right after a checkout.
export const last: { result: CheckoutResult | null } = { result: null };

// Finish a fake checkout: add to the collection and take the price from the balance.
// The balance never goes below Rp0.
export async function completeCheckout(cart: CartItem, method: string): Promise<CheckoutResult> {
  const wallet = (await getWallet()) as Wallet;
  const before = wallet.balance;
  const after = Math.max(0, before - cart.price);

  const item: SavedItem = {
    ...cart,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    method,
    hutang: 0,
  };
  const items = await getItems();
  const count = (await getCheckoutCount()) + 1;

  await setItem('items', [item, ...items]);
  await setItem<Wallet>('wallet', { ...wallet, balance: after });
  await setItem('checkoutsUsed', count);

  last.result = { item, before, after, count };
  return last.result;
}
