import { describe, expect, it } from 'vitest';
import { onlineSaving, pickFeeSource, quoteShipping, shippingAmount, type ShippingFeeSource } from './shipping-fee';

// The spec's example: cart 4999, address in Bani Suif.
const summary: ShippingFeeSource = {
  shipping: '206.00',
  shipping_fees: { cash_on_delivery: 206, paymob: 121, branch_pickup: 0 },
  free_shipping: false,
};
const subtotal = 4999;
const totalFor = (method: 'cash_on_delivery' | 'paymob' | 'branch_pickup') =>
  subtotal + shippingAmount(quoteShipping(method, summary));

describe('quoteShipping', () => {
  it('follows the selected payment method', () => {
    expect(totalFor('cash_on_delivery')).toBe(5205);
    expect(totalFor('paymob')).toBe(5120);
    expect(totalFor('branch_pickup')).toBe(4999);
  });

  it('is pickup for branch pickup, even without an address', () => {
    expect(quoteShipping('branch_pickup', { shipping_fees: null })).toEqual({ kind: 'pickup' });
  });

  it('is pending while the customer has no address', () => {
    expect(quoteShipping('paymob', { shipping: '0.00', shipping_fees: null })).toEqual({ kind: 'pending' });
  });

  it('is free only when the backend says so', () => {
    expect(quoteShipping('cash_on_delivery', { ...summary, free_shipping: true })).toEqual({ kind: 'free' });
    expect(quoteShipping('paymob', summary)).toEqual({ kind: 'fee', amount: 121 });
  });

  it('falls back to the single shipping number for older responses', () => {
    expect(quoteShipping('paymob', { shipping: '50.00' })).toEqual({ kind: 'fee', amount: 50 });
  });
});

describe('onlineSaving', () => {
  it('is the cash fee minus the online fee', () => {
    expect(onlineSaving(summary)).toBe(85);
  });

  it('is 0 with free shipping or no fees', () => {
    expect(onlineSaving({ ...summary, free_shipping: true })).toBe(0);
    expect(onlineSaving({ shipping_fees: null })).toBe(0);
  });
});

describe('pickFeeSource', () => {
  it("prefers the address's fees, else the cart's", () => {
    const address: ShippingFeeSource = { shipping_fees: { cash_on_delivery: 90, paymob: 60, branch_pickup: 0 } };
    expect(pickFeeSource(address, summary)).toBe(address);
    expect(pickFeeSource({}, summary)).toBe(summary);
    expect(pickFeeSource(null, summary)).toBe(summary);
  });
});
