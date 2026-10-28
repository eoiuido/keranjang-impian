// Online backup for paid users (spec.md section 4): numbers and names only.
// Photos and the address never leave the phone (the server also removes them).
import { fetchBackup, uploadBackup } from './api';
import { getCheckoutCount, getItems, type SavedItem } from './collection';
import { getGoal, type Goal } from './goal';
import { isPaid } from './plan';
import { getProfile, type Profile, type Wallet } from './profile';
import { getItem, setItem } from './store';

type BackupItem = Omit<SavedItem, 'photo'>;

export type BackupData = {
  version: 1;
  profile: Profile | null;
  wallet: Wallet | null;
  items: BackupItem[];
  checkoutsUsed: number;
  declineOfferSeen: boolean;
  goal?: Goal | null;
};

async function build(): Promise<BackupData> {
  const [profile, wallet, items, checkoutsUsed, declineOfferSeen, goal] = await Promise.all([
    getProfile(),
    getItem<Wallet>('wallet'),
    getItems(),
    getCheckoutCount(),
    getItem<boolean>('declineOfferSeen'),
    getGoal(),
  ]);
  return {
    version: 1,
    profile: profile ?? null,
    wallet: wallet ?? null,
    items: items.map(({ photo: _photo, ...rest }) => rest),
    checkoutsUsed,
    declineOfferSeen: declineOfferSeen === true,
    goal,
  };
}

// Upload this phone's numbers. Never throws: when offline it retries on the next call.
export async function syncBackup(): Promise<void> {
  const token = await getItem<string>('session');
  if (!token || !(await isPaid())) return;
  try {
    await uploadBackup(token, await build());
    await setItem('backupDirty', false);
  } catch {
    await setItem('backupDirty', true);
  }
}

export async function syncBackupIfDirty(): Promise<void> {
  if (await getItem<boolean>('backupDirty')) await syncBackup();
}

// After logging in on a new phone: bring the numbers back, merged with anything already here.
export async function restoreBackup(token: string): Promise<boolean> {
  let data: BackupData | null = null;
  try {
    data = (await fetchBackup<BackupData>(token)).data;
  } catch {
    return false;
  }
  if (!data || data.version !== 1) return false;

  const [localItems, localCount, localOffer] = await Promise.all([
    getItems(),
    getCheckoutCount(),
    getItem<boolean>('declineOfferSeen'),
  ]);
  // Union of items by id; items on this phone keep their photo.
  const byId = new Map<string, SavedItem>(data.items.map((i) => [i.id, i as SavedItem]));
  for (const i of localItems) byId.set(i.id, i);
  const items = [...byId.values()].sort((a, b) => b.date.localeCompare(a.date));

  // The account's money numbers win; the monthly rollover runs on next load.
  if (data.profile) await setItem('profile', data.profile);
  if (data.wallet) await setItem('wallet', data.wallet);
  await setItem('items', items);
  await setItem('checkoutsUsed', Math.max(localCount, data.checkoutsUsed));
  await setItem('declineOfferSeen', localOffer === true || data.declineOfferSeen);
  if (data.goal && !(await getGoal())) await setItem('goal', data.goal);
  return true;
}
