// Shipping fee shown at each checkout step. The backend prices shipping (Bosta rates for the
// address's city, by payment method) — never calculate it here, only pick the right number.

import type { PaymentMethod } from '@/lib/hooks/useOrders';
// Relative (not @/) so the unit tests can load this file.
import { isFreeShippingCoupon, type Coupon } from './coupon';

export type ShippingFees = Record<PaymentMethod, number>;

/** Anything that carries the backend's fees: the cart summary or one address. */
export interface ShippingFeeSource {
    shipping_fees?: ShippingFees | null;
    free_shipping?: boolean;
    /** Cart summary only: the fee for the default method (cash on delivery). */
    shipping?: string | number;
}

export type ShippingQuote =
    | { kind: 'pickup' }   // branch pickup: no shipping
    | { kind: 'free' }     // free_shipping from the backend
    | { kind: 'pending' }  // no address yet, so no price
    | { kind: 'fee'; amount: number };

export function quoteShipping(
    method: PaymentMethod,
    source: ShippingFeeSource | null | undefined,
    /** A free-shipping coupon waives the fee (once the address is known). */
    coupon?: Coupon | null,
): ShippingQuote {
    if (method === 'branch_pickup') return { kind: 'pickup' };
    if (source && isFreeShippingCoupon(coupon)) return { kind: 'free' };
    if (!source) return { kind: 'pending' };
    if (source.free_shipping) return { kind: 'free' };
    if (source.shipping_fees === null) return { kind: 'pending' };
    if (source.shipping_fees) return { kind: 'fee', amount: Number(source.shipping_fees[method] ?? 0) };
    // Older responses without shipping_fees: fall back to the single shipping number.
    return source.shipping != null ? { kind: 'fee', amount: Number(source.shipping) } : { kind: 'pending' };
}

/** What the quote adds to the total. */
export function shippingAmount(quote: ShippingQuote): number {
    return quote.kind === 'fee' ? quote.amount : 0;
}

/** "Pay online and save X": cash-on-delivery fee minus online fee (0 when there's no saving). */
export function onlineSaving(source: ShippingFeeSource | null | undefined, coupon?: Coupon | null): number {
    const fees = source?.shipping_fees;
    if (!fees || source?.free_shipping || isFreeShippingCoupon(coupon)) return 0;
    return Math.max(0, Number(fees.cash_on_delivery ?? 0) - Number(fees.paymob ?? 0));
}

/**
 * Prefer the address's fees (fetched with the coupon-adjusted cart_amount, so free shipping
 * follows the coupon); fall back to the cart summary's.
 */
export function pickFeeSource(
    address: ShippingFeeSource | null | undefined,
    summary: ShippingFeeSource | null | undefined,
): ShippingFeeSource | null | undefined {
    return address && address.shipping_fees !== undefined ? address : summary;
}
