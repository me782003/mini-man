'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import OrderTracking from '@/components/Orders/OrderTracking';
import { useOrderTracking } from '@/lib/hooks/useOrders';
import { ApiError } from '@/lib/fetcher';

interface Props {
    orderId: string;
    /** Standalone /orders/:id/track page (from email / SMS links): no account breadcrumb. */
    standalone?: boolean;
}

export default function OrderTrackingClient({ orderId, standalone = false }: Props) {
    const t = useTranslations('Orders');
    const tt = useTranslations('Tracking');
    const ta = useTranslations('Account');
    const tc = useTranslations('Common');
    const { data: tracking, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useOrderTracking(orderId);
    const notFound = error instanceof ApiError && error.status === 404;

    return (
        <>
            {!standalone && (
                <nav className="mb-[10px] flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                    <Link href="/" className="transition-colors hover:text-black">{tc('home')}</Link>
                    <span>/</span>
                    <Link href="/account" className="transition-colors hover:text-black">{tc('account')}</Link>
                    <span>/</span>
                    <Link href="/account/orders" className="transition-colors hover:text-black">{ta('orders')}</Link>
                    <span>/</span>
                    <Link href={`/account/orders/${orderId}`} className="transition-colors hover:text-black">#{orderId}</Link>
                    <span>/</span>
                    <span className="font-semibold text-black">{t('trackOrder')}</span>
                </nav>
            )}

            {/* Status, order number and refresh live in the summary card below. */}
            <h1 className="mt-6 font-beatrice text-[22px] font-bold leading-tight text-black sm:mt-8 sm:text-[28px]">
                {t('trackOrder')}
            </h1>

            <div className="mt-6">
                {isLoading ? (
                    <TrackingSkeleton />
                ) : notFound ? (
                    <div className="flex flex-col items-center py-16 text-center">
                        <p className="font-beatrice text-[20px] font-bold text-black">{tt('orderNotFound')}</p>
                        <p className="mt-2 font-beatrice text-[14px] text-gray-500">{tt('orderNotFoundHint')}</p>
                        <Link href="/account/orders" className="mt-5 bg-black px-6 py-3 font-beatrice text-[14px] font-semibold text-white hover:bg-neutral-800">
                            {t('viewOrders')}
                        </Link>
                    </div>
                ) : isError || !tracking ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-5 font-beatrice text-[14px] text-red-600">
                        <p>{error?.message || t('trackingError')}</p>
                        <button onClick={() => refetch()} className="mt-2 font-semibold text-black underline underline-offset-2">
                            {tt('retry')}
                        </button>
                    </div>
                ) : (
                    <OrderTracking
                        tracking={tracking}
                        orderId={orderId}
                        onRefresh={() => refetch()}
                        refreshing={isFetching}
                        updatedAt={dataUpdatedAt}
                    />
                )}
            </div>

        </>
    );
}

export function TrackingSkeleton() {
    return (
        <div className="space-y-4" aria-hidden>
            <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
            <div className="space-y-6 rounded-lg border border-gray-200 p-6">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                    </div>
                ))}
            </div>
        </div>
    );
}
