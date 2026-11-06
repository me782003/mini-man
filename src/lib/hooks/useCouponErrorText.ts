'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ApiError } from '@/lib/fetcher';
import { classifyCouponError, parseMinimumAmount, type CouponProblem } from '@/lib/coupon';
import { intlLocale } from '@/lib/intl';

/** The coupon problem behind an API error, or null when it isn't a coupon error. */
export function couponProblemOf(err: unknown): CouponProblem | null {
  if (!(err instanceof ApiError) || err.status >= 500 || (err.status !== 400 && err.status !== 404)) return null;
  const problem = classifyCouponError(err.status, err.message);
  return problem === 'unknown' ? null : problem;
}

/**
 * Translated text for a coupon error (the server's message is English-only).
 * `removed`: the coupon was already applied and is being taken off.
 */
export function useCouponErrorText() {
  const t = useTranslations('Coupon');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const money = (n: number) =>
    tc('currency', { amount: n.toLocaleString(intlLocale(locale), { maximumFractionDigits: 2 }) });

  return (err: unknown, { subtotal = 0, removed = false }: { subtotal?: number; removed?: boolean } = {}): string => {
    if (!(err instanceof ApiError) || err.status >= 500) return t('error');
    const problem = classifyCouponError(err.status, err.message);
    if (problem === 'minimum') {
      const min = parseMinimumAmount(err.message) ?? 0;
      return removed
        ? t('removedMinimum', { amount: money(min) })
        : t('addMore', { amount: money(Math.max(0, min - subtotal)) });
    }
    const reason =
      problem === 'expired' ? t('expired')
      : problem === 'notStarted' ? t('notStarted')
      : problem === 'inactive' ? t('inactive')
      : problem === 'usedUp' ? t('usedUp')
      : t('invalid');
    return removed ? t('removedReason', { reason }) : reason;
  };
}
