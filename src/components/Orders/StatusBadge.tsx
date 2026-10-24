'use client';

import { useTranslations } from 'next-intl';

const ORDER_STATUS_STYLES: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-amber-100 text-amber-800',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-gray-100 text-gray-700',
    partially_refunded: 'bg-amber-100 text-amber-800',
    refunded: 'bg-amber-100 text-amber-800',
};

const base = 'inline-flex items-center rounded-full px-3 py-1 font-beatrice text-[12px] font-semibold';

export function OrderStatusBadge({ status }: { status: string }) {
    const t = useTranslations('Tracking');
    const key = `status_${status}`;
    return (
        <span className={`${base} ${ORDER_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700'}`}>
            {t.has(key) ? t(key) : status}
        </span>
    );
}

export function PaymentStatusBadge({ status }: { status: string }) {
    const t = useTranslations('Tracking');
    const key = `payment_${status}`;
    return (
        <span className={`${base} ${PAYMENT_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700'}`}>
            {t.has(key) ? t(key) : status}
        </span>
    );
}
