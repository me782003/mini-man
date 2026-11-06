// Coupon maths and storage. Kept free of React so it can be unit-tested directly.

export interface Coupon {
  id: number;
  code: string;
  /** `free_shipping`: no discount on the items — the order ships free instead. */
  type: 'percentage' | 'fixed' | 'free_shipping';
  /** Some APIs flag free shipping on a regular coupon instead of using the type. */
  free_shipping?: boolean | number;
  value: string;
  max_discount: string | null;
}

/**
 * Same formula the backend applies at checkout. The validate endpoint doesn't return
 * the discount, so the shown total must be computed exactly like this.
 * Unrounded — round for display only.
 */
export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.type === 'free_shipping') return 0;
  const value = parseFloat(coupon.value);
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = subtotal * (value / 100);
    if (coupon.max_discount !== null && discount > parseFloat(coupon.max_discount)) {
      discount = parseFloat(coupon.max_discount);
    }
  } else {
    discount = value;
  }
  // Never let the total go negative.
  return Math.max(0, Math.min(discount, subtotal));
}

/** The coupon waives the shipping fee (a free-shipping coupon, or one flagged with it). */
export function isFreeShippingCoupon(coupon: Coupon | null | undefined): boolean {
  if (!coupon) return false;
  return coupon.type === 'free_shipping' || coupon.free_shipping === true || coupon.free_shipping === 1;
}

export type CouponProblem = 'expired' | 'notStarted' | 'inactive' | 'usedUp' | 'minimum' | 'invalid' | 'unknown';

/**
 * Sorts the backend's coupon error (its `message` is always English) into a known case,
 * so the customer sees a translated message instead of the raw server text.
 */
export function classifyCouponError(status: number, message: string): CouponProblem {
  const m = message.toLowerCase();
  if (/minimum/.test(m) && parseMinimumAmount(message) !== null) return 'minimum';
  if (/usage limit/.test(m)) return 'usedUp';
  if (/not started|not yet/.test(m)) return 'notStarted';
  // "Invalid or expired coupon" is the generic not-found answer, not a known expiry.
  if (/expired/.test(m) && !/invalid/.test(m)) return 'expired';
  if (/not active|inactive|disabled/.test(m)) return 'inactive';
  if (status === 404 || /not found|invalid|does not exist/.test(m)) return 'invalid';
  return 'unknown';
}

/** True when a percentage coupon was limited by its max_discount. */
export function isDiscountCapped(coupon: Coupon, subtotal: number): boolean {
  if (coupon.type !== 'percentage' || coupon.max_discount === null) return false;
  return subtotal * (parseFloat(coupon.value) / 100) > parseFloat(coupon.max_discount);
}

/** Codes are matched case-insensitively; send them trimmed and upper-cased. */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

/** "Minimum order amount for this coupon is 500.00" → 500 */
export function parseMinimumAmount(message: string): number | null {
  const match = message.trim().match(/([\d.,]+)\s*(?:EGP|LE|جنيه)?\.?$/i);
  if (!match) return null;
  const n = parseFloat(match[1].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

// ── Persistence (sessionStorage) ─────────────────────────────────────────────

const STORAGE_KEY = 'applied_coupon';
const CHANGE_EVENT = 'applied-coupon-change';

export function readStoredCoupon(): Coupon | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Coupon) : null;
  } catch {
    return null;
  }
}

export function storeCoupon(coupon: Coupon | null) {
  if (typeof window === 'undefined') return;
  try {
    if (coupon) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coupon));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private mode) — the coupon just won't survive a refresh.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeToCoupon(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}
