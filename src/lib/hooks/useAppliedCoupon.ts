'use client';

import { useSyncExternalStore } from 'react';
import { calculateDiscount, isDiscountCapped, readStoredCoupon, storeCoupon, subscribeToCoupon, type Coupon } from '@/lib/coupon';

// sessionStorage hands back a new object on every read; cache by raw value so
// useSyncExternalStore gets a stable snapshot.
let cachedRaw: string | null = null;
let cachedCoupon: Coupon | null = null;

function getSnapshot(): Coupon | null {
  const coupon = readStoredCoupon();
  const raw = coupon ? JSON.stringify(coupon) : null;
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedCoupon = coupon;
  }
  return cachedCoupon;
}

/** The one applied coupon, shared by cart → shipping → payment → checkout and kept across refreshes. */
export function useAppliedCoupon(subtotal = 0) {
  const coupon = useSyncExternalStore(subscribeToCoupon, getSnapshot, () => null);
  return {
    coupon,
    discount: coupon ? calculateDiscount(coupon, subtotal) : 0,
    capped: coupon ? isDiscountCapped(coupon, subtotal) : false,
    setCoupon: (next: Coupon) => storeCoupon(next),
    clearCoupon: () => storeCoupon(null),
  };
}
