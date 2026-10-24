'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Tag, X } from 'lucide-react';
import { ApiError } from '@/lib/fetcher';
import { normalizeCouponCode, parseMinimumAmount } from '@/lib/coupon';
import { useAppliedCoupon } from '@/lib/hooks/useAppliedCoupon';
import { useValidateCoupon } from '@/lib/hooks/useOrders';
import { intlLocale } from '@/lib/intl';

type Message = { tone: 'success' | 'error'; text: string } | null;

/**
 * Coupon input for the cart summary and checkout. Validates only on Apply / Enter,
 * keeps one coupon at a time, and re-validates whenever the subtotal changes.
 */
export default function CouponField({ subtotal }: { subtotal: number }) {
    const t = useTranslations('Coupon');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const { coupon, capped, setCoupon, clearCoupon } = useAppliedCoupon(subtotal);
    const validate = useValidateCoupon();
    const [input, setInput] = useState('');
    const [message, setMessage] = useState<Message>(null);
    // The code+subtotal pair last confirmed with the backend.
    const lastChecked = useRef<string | null>(null);

    const money = (n: number) =>
        tc('currency', { amount: n.toLocaleString(intlLocale(locale), { maximumFractionDigits: 2 }) });

    const errorMessage = (err: unknown, revalidating: boolean): string => {
        if (err instanceof ApiError) {
            if (err.status === 404) return revalidating ? t('removedInvalid') : t('invalid');
            if (err.status === 400) {
                const min = parseMinimumAmount(err.message);
                if (min !== null) {
                    return revalidating
                        ? t('removedMinimum', { amount: money(min) })
                        : t('addMore', { amount: money(Math.max(0, min - subtotal)) });
                }
                return err.message;
            }
        }
        return t('error');
    };

    const apply = () => {
        const code = normalizeCouponCode(input);
        if (!code || validate.isPending) return;
        setMessage(null);
        validate.mutate({ code, cart_amount: subtotal }, {
            onSuccess: ({ data }) => {
                // Applying a new code replaces the old one.
                setCoupon(data);
                lastChecked.current = `${data.code}|${subtotal}`;
                setInput('');
                setMessage({ tone: 'success', text: t('applied', { code: data.code }) });
            },
            onError: (err) => setMessage({ tone: 'error', text: errorMessage(err, false) }),
        });
    };

    const remove = () => {
        clearCoupon();
        lastChecked.current = null;
        setMessage(null);
    };

    // Cart changed (or page reloaded with a stored coupon) → confirm it still applies.
    useEffect(() => {
        if (!coupon || subtotal <= 0) return;
        const key = `${coupon.code}|${subtotal}`;
        if (lastChecked.current === key) return;
        lastChecked.current = key;
        validate.mutate({ code: coupon.code, cart_amount: subtotal }, {
            onSuccess: ({ data }) => setCoupon(data),
            onError: (err) => {
                if (err instanceof ApiError && (err.status === 400 || err.status === 404)) {
                    clearCoupon();
                    lastChecked.current = null;
                    setMessage({ tone: 'error', text: errorMessage(err, true) });
                }
                // Network / 500: keep the coupon — the backend re-checks it at checkout anyway.
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coupon?.code, subtotal]);

    const discountLabel = coupon
        ? coupon.type === 'percentage'
            ? `−${parseFloat(coupon.value).toLocaleString(intlLocale(locale), { maximumFractionDigits: 2 })}%`
            : `−${money(parseFloat(coupon.value))}`
        : '';

    return (
        <div className="mb-4">
            <p className="mb-2 font-beatrice text-[13px] font-semibold text-black">{t('label')}</p>

            {coupon ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-green-300 bg-green-50 px-3 py-2.5">
                    <span className="flex min-w-0 items-center gap-2 font-beatrice text-[13px] font-semibold text-green-800">
                        <Tag size={15} className="shrink-0" />
                        <span dir="ltr" className="truncate">{coupon.code}</span>
                        <span className="shrink-0 font-medium">· {discountLabel}</span>
                    </span>
                    <button
                        type="button"
                        onClick={remove}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-green-800 transition-colors hover:bg-green-100"
                        aria-label={t('remove')}
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <form
                    className="flex gap-2"
                    onSubmit={(e) => { e.preventDefault(); apply(); }}
                >
                    <div className="relative flex-1">
                        <Tag size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase())}
                            placeholder={t('placeholder')}
                            aria-label={t('label')}
                            autoComplete="off"
                            className="w-full rounded-lg border border-gray-300 py-3 pe-3 ps-9 font-beatrice text-[14px] uppercase placeholder:normal-case placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || validate.isPending}
                        className="flex min-w-[96px] shrink-0 items-center justify-center rounded-lg bg-black px-5 font-beatrice text-[14px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                    >
                        {validate.isPending
                            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label={tc('loading')} />
                            : t('apply')}
                    </button>
                </form>
            )}

            {coupon && capped && coupon.max_discount !== null && (
                <p className="mt-1.5 font-beatrice text-[12px] text-gray-500">
                    {t('maxDiscount', { amount: money(parseFloat(coupon.max_discount)) })}
                </p>
            )}

            {message && (
                <p
                    role={message.tone === 'error' ? 'alert' : 'status'}
                    className={`mt-1.5 font-beatrice text-[12px] font-medium ${message.tone === 'success' ? 'text-green-700' : 'text-red-600'}`}
                >
                    {message.text}
                </p>
            )}
        </div>
    );
}
