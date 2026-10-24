'use client';

import { useSyncExternalStore } from 'react';

// Login-only queries (cart, profile, favourites, orders…) must not run for guests:
// without a token the API answers 401/403 and the requests are wasted.

const CHANGE_EVENT = 'auth-token-change';

export function hasAuthToken(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!window.localStorage.getItem('token');
  } catch {
    return false;
  }
}

/** Call right after saving or removing the token so waiting queries start (or stop). */
export function notifyAuthChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback); // login / logout in another tab
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

/** Reactive "is someone logged in" — false during SSR. Use as a query's `enabled`. */
export function useHasAuthToken(): boolean {
  return useSyncExternalStore(subscribe, hasAuthToken, () => false);
}
