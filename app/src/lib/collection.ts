import type { CartItem } from './cart';
import { applyCheckout } from './money';
import { loadWallet, saveWallet, type Wallet } from './profile';
import { getItem, setItem } from './store';

export type SavedItem = CartItem & {
  id: string;
  date: string; // ISO time of the fake checkout
  method: string; // fake payment method chosen
  hutang: number; // fake debt taken for this item (0 if none)
};

export type CheckoutResult = {
  item: SavedItem;
  before: number;
  after: number;
  debt: number; // total fake debt after this checkout
  count: number;
};

export const getItems = async () => (await getItem<SavedItem[]>('items')) ?? [];
export const getCheckoutCount = async () => (await getItem<number>('checkoutsUsed')) ?? 0;
export const getAddress = async () => (await getItem<string>('address')) ?? '';
export const saveAddress = (a: string) => setItem('address', a); // phone only, never uploaded

// Shown by the success screen right after a checkout.
export const last: { result: CheckoutResult | null } = { result: null };

// Finish a fake checkout: add to the collection and take the price from the balance.
// The balance never goes below Rp0; with hutang the shortfall becomes debt.
export async function completeCheckout(cart: CartItem, method: string, useHutang: boolean): Promise<CheckoutResult> {
  const wallet = (await loadWallet()) as Wallet;
  const next = applyCheckout(wallet, cart.price, useHutang);

  const item: SavedItem = {
    ...cart,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    method,
    hutang: next.hutang,
  };
  const items = await getItems();
  const count = (await getCheckoutCount()) + 1;

  await setItem('items', [item, ...items]);
  await saveWallet({ ...wallet, balance: next.balance, debt: next.debt });
  await setItem('checkoutsUsed', count);

  last.result = { item, before: wallet.balance, after: next.balance, debt: next.debt, count };
  return last.result;
}
