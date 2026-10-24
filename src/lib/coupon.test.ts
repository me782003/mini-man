import { describe, expect, it } from 'vitest';
import { calculateDiscount, isDiscountCapped, normalizeCouponCode, parseMinimumAmount, type Coupon } from './coupon';

const coupon = (overrides: Partial<Coupon>): Coupon => ({
  id: 1,
  code: 'TEST',
  type: 'percentage',
  value: '20.00',
  max_discount: null,
  ...overrides,
});

describe('calculateDiscount', () => {
  it('applies a percentage coupon', () => {
    expect(calculateDiscount(coupon({ type: 'percentage', value: '20.00' }), 700)).toBe(140);
  });

  it('caps a percentage coupon at max_discount', () => {
    const c = coupon({ type: 'percentage', value: '20.00', max_discount: '100.00' });
    expect(calculateDiscount(c, 700)).toBe(100);
    expect(isDiscountCapped(c, 700)).toBe(true);
  });

  it('ignores a null max_discount instead of producing NaN', () => {
    expect(calculateDiscount(coupon({ value: '10.00', max_discount: null }), 1000)).toBe(100);
  });

  it('applies a fixed coupon', () => {
    expect(calculateDiscount(coupon({ type: 'fixed', value: '50.00' }), 700)).toBe(50);
  });

  it('never exceeds the subtotal for a fixed coupon larger than the cart', () => {
    const c = coupon({ type: 'fixed', value: '500.00' });
    expect(calculateDiscount(c, 300)).toBe(300);
    expect(300 - calculateDiscount(c, 300)).toBe(0);
  });
});

describe('helpers', () => {
  it('normalizes codes', () => {
    expect(normalizeCouponCode('  summer20 ')).toBe('SUMMER20');
  });

  it('reads the minimum from the backend message', () => {
    expect(parseMinimumAmount('Minimum order amount for this coupon is 500.00')).toBe(500);
    expect(parseMinimumAmount('Invalid or expired coupon')).toBeNull();
  });
});
