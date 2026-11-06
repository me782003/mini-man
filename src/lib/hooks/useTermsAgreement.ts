'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'mini-man:terms-agreed';
const CHANGE_EVENT = 'terms-agreement-change';
let fallbackAgreed: boolean | null = null;

function getSnapshot(): boolean {
  if (fallbackAgreed !== null) return fallbackAgreed;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      fallbackAgreed = null;
      callback();
    }
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

function setAgreed(agreed: boolean) {
  fallbackAgreed = agreed;
  try {
    if (agreed) window.localStorage.setItem(STORAGE_KEY, 'true');
    else window.localStorage.removeItem(STORAGE_KEY);
    fallbackAgreed = null;
  } catch {
    // Keep the checkbox usable when browser storage is blocked.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Remember the choice in this browser across cart visits and refreshes. */
export function useTermsAgreement() {
  const agreed = useSyncExternalStore(subscribe, getSnapshot, () => false);
  return [agreed, setAgreed] as const;
}
