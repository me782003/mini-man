'use client';

import { useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { CircleCheckBig } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import BranchCard from '@/components/Orders/BranchCard';
import type { CheckoutResult, PaymentMethod } from '@/lib/hooks/useOrders';
import { intlLocale } from '@/lib/intl';

interface PlacedOrder {
    result: CheckoutResult;
    message: string;
    couponNotice?: string;
}

const storageKey = (orderId: number | string) => `placed_order:${orderId}`;

/** Called by checkout right before `router.replace` to the success page. */
export function savePlacedOrder(order: PlacedOrder) {
    try {
        window.sessionStorage.setItem(storageKey(order.result.order_id), JSON.stringify(order));
    } catch {
        // Storage blocked — the success page still shows the order number.
    }
}

const METHOD_LABEL: Record<PaymentMethod, 'cod' | 'online' | 'branch'> = {
    cash_on_delivery: 'cod',
    paymob: 'online',
    branch_pickup: 'branch',
};

const noopSubscribe = () => () => {};

export default function OrderSuccessClient() {
    const t = useTranslations('Orders');
    const locale = useLocale();
    const orderId = useSearchParams().get('id') ?? '';
    // Read once on the client; on the server (and without storage) fall back to the id alone.
    const raw = useSyncExternalStore(
        noopSubscribe,
        () => { try { return window.sessionStorage.getItem(storageKey(orderId)); } catch { return null; } },
        () => null,
    );
    const order: PlacedOrder | null = raw ? JSON.parse(raw) : null;
    const result = order?.result;
    const branch = result?.pickup_branch;

    return (
        <div className="container max-w-[640px] py-12 md:py-16">
            <div className="flex flex-col items-center text-center">
                <CircleCheckBig size={56} strokeWidth={1.5} className="text-[#6aaa84]" />
                <h1 className="mt-5 font-beatrice text-[22px] font-bold text-black md:text-[28px]">{t('orderPlaced')}</h1>
                {orderId && (
                    <p className="mt-2 font-beatrice text-[15px] text-gray-600">{t('orderTitle', { id: orderId })}</p>
                )}
                {result && (
                    <p className="mt-1 font-beatrice text-[15px] text-gray-600">
                        {t('total')}: {t('amount', { amount: Number(result.total_amount).toLocaleString(intlLocale(locale), { maximumFractionDigits: 2 }) })}
                        {' · '}
                        {t(METHOD_LABEL[result.payment_method] ?? 'cod')}
                    </p>
                )}
                {order?.message && <p className="mt-3 font-beatrice text-[14px] text-gray-500">{order.message}</p>}
                {order?.couponNotice && (
                    <p role="alert" className="mt-4 border border-amber-300 bg-amber-50 px-4 py-3 font-beatrice text-[13px] font-medium text-amber-800">
                        {order.couponNotice}
                    </p>
                )}
            </div>

            {result?.payment_method === 'branch_pickup' && branch && (
                <div className="mt-8">
                    <p className="mb-3 font-beatrice text-[16px] font-bold text-black">{t('pickupBranch')}</p>
                    <BranchCard branch={branch} variant="compact" />
                    <p className="mt-3 border border-[#388E3C] bg-[#E8F5E9] px-4 py-3 font-beatrice text-[13px] font-medium text-[#388E3C]">
                        {t('pickupReadyNote')}
                    </p>
                </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                {orderId && (
                    <Link
                        href={`/account/orders/${orderId}/tracking`}
                        className="bg-black px-6 py-3 text-center font-beatrice text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800"
                    >
                        {t('trackOrder')}
                    </Link>
                )}
                <Link
                    href="/account/orders"
                    className="border border-black px-6 py-3 text-center font-beatrice text-[15px] font-semibold text-black transition-colors hover:bg-gray-100"
                >
                    {t('viewOrders')}
                </Link>
                <Link
                    href="/products"
                    className="px-6 py-3 text-center font-beatrice text-[15px] font-semibold text-gray-600 underline underline-offset-2 hover:text-black"
                >
                    {t('continueShopping')}
                </Link>
            </div>
        </div>
    );
}
