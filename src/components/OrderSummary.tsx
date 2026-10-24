'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';

function LockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
    );
}

export function SecurePaymentBadge() {
    const t = useTranslations('Checkout');
    return (
        <div className="flex items-start gap-3 border border-[#388E3C] bg-[#E8F5E9] p-5">
            <span className="mt-0.5 shrink-0 text-[#4caf7d]">
                <LockIcon />
            </span>
            <div>
                <p className="font-beatrice text-[13px] font-bold text-[#388E3C]">
                    {t('securePayment')}
                </p>
                <p className="font-beatrice text-[14px] text-[#388E3C]">
                    {t('securePaymentDesc')}
                </p>
            </div>
        </div>
    );
}

import type { CartSummary } from '@/lib/hooks/useCart';
import { intlLocale } from '@/lib/intl';

interface OrderSummaryProps {
    summary?: CartSummary;
    isLoading?: boolean;
    couponCode?: string;
    discountAmount?: number;
    className?: string;
    children?: React.ReactNode;
}

export default function OrderSummary({ summary, isLoading, couponCode, discountAmount, className, children }: OrderSummaryProps) {
    const t = useTranslations('Checkout');
    const c = useTranslations('Common');
    const locale = useLocale();
    const money = (n: number) => c('currency', { amount: n.toLocaleString(intlLocale(locale), { maximumFractionDigits: 2 }) });
    const subtotal  = Number(summary?.subtotal ?? 0);
    const tax       = Number(summary?.tax ?? 0);
    const shipping  = Number(summary?.shipping ?? 0);
    const discount  = discountAmount ?? Number(summary?.discount ?? 0);
    const coupon    = couponCode ?? summary?.coupon_code ?? null;
    const total     = subtotal - discount + shipping + tax;

    return (
        <div className={className ?? ' w-full md:w-[507px] shrink-0 border border-gray-200 p-5 md:p-10'}>
            <h2 className="mb-5 md:mb-10 font-beatrice text-[20px] font-bold text-black">
                {c('orderSummary')}
            </h2>

            {isLoading ? (
                <div className="mb-6 space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-5 w-full animate-pulse rounded bg-gray-100" />
                    ))}
                </div>
            ) : (
                <div className="mb-4 space-y-[20px]">
                    <div className="flex justify-between font-beatrice text-[14px] md:text-[16px]">
                        <span className="text-gray-500">{c('subtotal')}</span>
                        <span className="font-bold text-black">{money(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between font-beatrice text-[14px] md:text-[16px]">
                            <span className="text-green-700">
                                {coupon ? t('discountWithCode', { code: coupon }) : c('discount')}
                            </span>
                            <span className="font-bold text-green-700">−{money(discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-beatrice text-[14px] md:text-[16px]">
                        <span className="text-gray-500">{c('shipping')}</span>
                        <span className="font-bold text-black">
                            {shipping > 0 ? money(shipping) : c('free')}
                        </span>
                    </div>
                    {tax > 0 && (
                        <div className="flex justify-between font-beatrice text-[14px] md:text-[16px]">
                            <span className="text-gray-500">{c('tax')}</span>
                            <span className="font-bold text-black">{money(tax)}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="mb-6 border-t border-gray-200 pt-4">
                <div className="flex items-baseline justify-between font-beatrice">
                    <span className="text-[20px] font-bold text-black">{c('total')}</span>
                    <span className="text-[20px] font-extrabold text-black">{money(total)}</span>
                </div>
            </div>

            {children}
        </div>
    );
}
