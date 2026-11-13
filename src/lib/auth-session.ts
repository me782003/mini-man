// Login session helpers shared by every auth screen (password, OTP, Google).

import { notifyAuthChange } from '@/lib/auth-token';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function saveSession(token: string, user: unknown) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  document.cookie = `auth_token=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  notifyAuthChange();
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
  notifyAuthChange();
}

/**
 * "/ar/account?x=1" → "/account?x=1". The locale-aware router adds the current locale itself,
 * so a `redirect` param that already carries one must be stripped first (else "/ar/ar/…").
 * Anything that isn't a same-site path falls back to `fallback`.
 */
export function localRedirectPath(raw: string | null | undefined, fallback = '/account'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw.replace(/^\/(en|ar)(?=\/|\?|#|$)/, '') || '/';
}

/** The locale of the page we're on ("en" when it can't be told). */
export function currentLocale(): 'en' | 'ar' {
  if (typeof window === 'undefined') return 'en';
  return /^\/ar(\/|$)/.test(window.location.pathname) ? 'ar' : 'en';
}

export interface PhoneStatus {
  needs_phone?: boolean | null;
  phone?: string | null;
  is_verified?: number | boolean | null;
}

/**
 * "Add your phone number" page (/complete-phone). Temporarily hidden: nobody is sent there and the
 * URL shows "not found". Set to true to bring it back (after Google sign-in and from checkout).
 */
export const COMPLETE_PHONE_PAGE_ENABLED = false;

/** The server's `needs_phone`: true when the account has no verified phone (Google sign-ups). */
export function needsVerifiedPhone(user: PhoneStatus | null | undefined): boolean {
  return user?.needs_phone === true;
}

/** Where to send someone the server asked to verify a phone (checkout 403), coming back afterwards. */
export function completePhoneHref(back: string, required = false): string {
  return `/complete-phone?redirect=${encodeURIComponent(back)}${required ? '&required=1' : ''}`;
}
