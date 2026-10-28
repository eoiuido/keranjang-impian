// Log out and delete-my-data on the phone side (spec.md S16).
import { ApiError, deleteAccountApi, logoutApi } from './api';
import { clearAll, getItem, setItem } from './store';

export const getSessionToken = () => getItem<string>('session');

// Ends paid access on this phone only; the collection stays here.
export async function logout(): Promise<void> {
  const token = await getSessionToken();
  if (token) await logoutApi(token).catch(() => undefined); // offline: the session just stays unused
  await setItem('session', null);
  await setItem('access', null);
}

// Deletes the online account (if any) first, then everything on the phone.
// Throws ApiError('offline') if the online part can't be reached, so nothing is half-deleted.
export async function deleteEverything(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    try {
      await deleteAccountApi(token);
    } catch (e) {
      // An old or already-deleted session is fine; anything else (offline) stops here.
      if (!(e instanceof ApiError && e.code === 'unauthorized')) throw e;
    }
  }
  await clearAll();
}
