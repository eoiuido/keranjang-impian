// Product analytics. For now it only logs; the real service is connected in
// the tracking step (see spec.md section 6).
export function track(event: string, props?: Record<string, string | number | boolean>): void {
  if (__DEV__) console.log('[track]', event, props ?? '');
}
