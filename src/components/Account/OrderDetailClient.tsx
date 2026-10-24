'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Link, useRouter } from '@/i18n/navigation';
import { ApiError } from '@/lib/fetcher';
import {
    redirectToPayment,
    useOrderDetail,
    usePayOrder,
    useReorder,
} from '@/lib/hooks/useOrders';
import { intlLocale } from '@/lib/intl';
import CountryBadge from '@/components/Country/CountryBadge';
import BranchCard from '@/components/Orders/BranchCard';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/Orders/StatusBadge';
import { TrackingSkeleton } from './OrderTrackingClient';
import { Truck } from 'lucide-react';

const PAYMENT_METHOD_KEYS: Record<string, 'cod' | 'online' | 'branch'> = {
    cash_on_delivery: 'cod',
    cash: 'cod',
    paymob: 'online',
    branch_pickup: 'branch',
};

function formatDate(dateStr: string, locale: string) {
    return new Date(dateStr.replace(' ', 'T')).toLocaleDateString(intlLocale(locale), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

interface Props { orderId: string; }

export default function OrderDetailClient({ orderId }: Props) {
    const t = useTranslations('Orders');
    const tt = useTranslations('Tracking');
    const ta = useTranslations('Account');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const router = useRouter();
    const money = (val: string | number) =>
        tc('currency', { amount: Number(val).toLocaleString(intlLocale(locale), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });

    // Both load in parallel; both 404 for a missing / someone else's order.
    const { data, isLoading, error } = useOrderDetail(orderId);
    const reorder = useReorder();
    const payOrder = usePayOrder();
    const order = data?.data;

    if (isLoading) {
        return (
            <div className="space-y-4 pt-10" aria-hidden>
                <div className="h-10 w-1/3 animate-pulse rounded bg-gray-200" />
                <TrackingSkeleton />
            </div>
        );
    }

    if (!order) {
        const notFound = error instanceof ApiError && error.status === 404;
        return (
            <div className="flex flex-col items-center py-20 text-center">
                <p className="font-beatrice text-[20px] font-bold text-black">{notFound ? tt('orderNotFound') : tt('loadError')}</p>
                {notFound && <p className="mt-2 font-beatrice text-[14px] text-gray-500">{tt('orderNotFoundHint')}</p>}
                <Link href="/account/orders" className="mt-5 bg-black px-6 py-3 font-beatrice text-[14px] font-semibold text-white hover:bg-neutral-800">
                    {t('viewOrders')}
                </Link>
            </div>
        );
    }

    const addr = order.shipping_address;
    const pickupBranch = addr?.pickup_branch ?? null;
    const isPickup = order.payment_method === 'branch_pickup';
    const canPayNow = order.payment_method === 'paymob' && order.payment_status === 'unpaid' && order.current_status !== 'cancelled';
    const shipping = parseFloat(order.shipping_amount || '0');

    const handleReorder = () => {
        reorder.mutate(order.items, {
            onSuccess: ({ added, failed }) => {
                if (added === 0) {
                    // Nothing could be added — usually everything is sold out now.
                    toast.error(failed.find(f => f.message)?.message || tt('reorderNothingAdded'));
                    return;
                }
                if (failed.length > 0) {
                    toast.warning(tt('reorderPartial', { added, total: added + failed.length, items: failed.map(f => f.name).filter(Boolean).join(locale === 'ar' ? '، ' : ', ') }));
                } else {
                    toast.success(tt('reorderDone'));
                }
                router.push('/cart');
            },
            onError: (err) => toast.error(err.message),
        });
    };

    const handlePayNow = () => {
        payOrder.mutate(order.id, {
            onSuccess: ({ data: pay, message }) => {
                if (pay.redirect_to_payment && pay.payment_url) redirectToPayment(pay.payment_url);
                else toast.error(message);
            },
            onError: (err) => toast.error(err.message),
        });
    };

    return (
        <>
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">{tc('home')}</Link>
                <span>/</span>
                <Link href="/account" className="transition-colors hover:text-black">{tc('account')}</Link>
                <span>/</span>
                <Link href="/account/orders" className="transition-colors hover:text-black">{ta('orders')}</Link>
                <span>/</span>
                <span className="font-semibold text-black">#{order.id}</span>
            </nav>

            {/* 1. Header */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
                <h1 className="font-beatrice text-[30px] font-bold leading-tight text-black sm:text-[42px]">
                    {t('orderTitle', { id: order.id })}
                </h1>
                <OrderStatusBadge status={order.current_status} />
                <PaymentStatusBadge status={order.payment_status} />
                <Link
                    href={`/account/orders/${order.id}/tracking`}
                    className="ms-auto hidden items-center gap-2 bg-black px-5 py-2.5 md:inline-flex font-beatrice text-[14px] font-medium text-white transition-colors hover:bg-neutral-800"
                >
                    <Truck size={16} aria-hidden />
                    {t('trackOrder')}
                </Link>
            </div>
            <p className="mt-2 mb-6 font-beatrice text-[13px] text-gray-500 sm:mb-7 sm:text-[14px]">
                {t('placedOn', { date: formatDate(order.created_at, locale) })}
                {' · '}
                {PAYMENT_METHOD_KEYS[order.payment_method] ? t(PAYMENT_METHOD_KEYS[order.payment_method]) : order.payment_method}
            </p>

            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
                <div className="min-w-0 flex-1 space-y-6">
                    {/* 3. Items */}
                    <section aria-labelledby="items-heading">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h2 id="items-heading" className="font-beatrice text-[18px] font-bold text-black">{tt('items')}</h2>
                            <Link
                                href={`/account/orders/${order.id}/tracking`}
                                className="inline-flex items-center gap-1.5 bg-black px-4 py-2 font-beatrice text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 md:hidden"
                            >
                                <Truck size={15} aria-hidden />
                                {t('trackOrder')}
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
                            {order.items.map(item => {
                                const snap = item.product_snapshot;
                                const variant = snap.variant_details;
                                const unit = parseFloat(item.price_at_purchase);
                                return (
                                    <Link key={item.id} href={`/products/${snap.slug || item.product_id}`} className="flex gap-4 p-4 transition-colors hover:bg-gray-50 sm:gap-5 sm:p-5">
                                        <div className="h-[90px] w-[90px] shrink-0 overflow-hidden rounded-lg bg-[#e8e8e8] sm:h-[110px] sm:w-[110px]">
                                            <img
                                                src={snap.image_url}
                                                alt={snap.name}
                                                className="h-full w-full object-contain p-2 mix-blend-multiply"
                                                onError={e => { const img = e.currentTarget as HTMLImageElement; img.src = '/images/logo.png'; img.classList.add('opacity-20'); }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1 font-beatrice">
                                            <p className="text-[15px] font-semibold text-black sm:text-[16px]">{snap.name}</p>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-gray-500">
                                                {variant && (
                                                    <>
                                                        <span className="flex items-center gap-1.5">
                                                            {tc('color')}
                                                            <span className="inline-block h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: variant.color_hexa }} />
                                                        </span>
                                                        <span>{tc('size')} <span className="font-semibold text-black">{variant.size}</span></span>
                                                    </>
                                                )}
                                                <span>{tc('qty')} <span className="font-semibold text-black">{item.quantity.toLocaleString(intlLocale(locale))}</span></span>
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 text-[13px] text-gray-500">
                                                <span>{tt('unitPrice')}: {money(unit)}</span>
                                                <span className="text-[15px] font-bold text-black">{money(unit * item.quantity)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* 5. Delivery info */}
                    <section aria-labelledby="delivery-heading" className="rounded-lg bg-gray-50 p-5 sm:p-6">
                        <h2 id="delivery-heading" className="mb-3 font-beatrice text-[16px] font-semibold text-black">
                            {isPickup ? t('pickupBranch') : tt('deliveryInfo')}
                        </h2>
                        {isPickup ? (
                            pickupBranch ? <BranchCard branch={pickupBranch} variant="compact" /> : <p className="font-beatrice text-[14px] text-gray-500">—</p>
                        ) : addr ? (
                            <div className="space-y-0.5 font-beatrice text-[14px] text-gray-700">
                                <p className="font-medium text-black">{addr.first_name} {addr.last_name}</p>
                                <p dir="ltr" className="rtl:text-right">{addr.phone}</p>
                                <p>{[addr.street_address, addr.apartment].filter(Boolean).join(', ')}</p>
                                <p>{[addr.bosta_district_name, addr.bosta_city_name || addr.city].filter(Boolean).join(', ')}</p>
                                <CountryBadge countryId={addr.country_id} />
                            </div>
                        ) : null}
                    </section>
                </div>

                {/* 4. Summary + 6. Actions */}
                <aside className="w-full shrink-0 rounded-lg border border-gray-200 p-5 sm:p-6 xl:sticky xl:top-[calc(var(--header-h,7rem)+1.5rem)] xl:w-[300px]">
                    <p className="mb-5 font-beatrice text-[18px] font-bold text-black">{tc('orderSummary')}</p>
                    <div className="space-y-3 font-beatrice text-[14px] text-gray-600">
                        <div className="flex justify-between gap-4">
                            <span>{tc('subtotal')}</span>
                            <span className="text-end font-medium text-black">{money(order.subtotal)}</span>
                        </div>
                        {parseFloat(order.coupon_discount || '0') > 0 && (
                            <div className="flex justify-between gap-4 text-green-700">
                                <span>{tc('discount')}</span>
                                <span className="text-end font-medium">−{money(order.coupon_discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between gap-4">
                            <span>{tc('shipping')}</span>
                            <span className="text-end font-medium text-black">{shipping > 0 ? money(shipping) : tc('free')}</span>
                        </div>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    <div className="flex justify-between gap-4 font-beatrice text-[16px] font-bold text-black">
                        <span>{tc('total')}</span>
                        <span className="text-end">{money(order.total_amount)}</span>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                        {canPayNow && (
                            <button
                                onClick={handlePayNow}
                                disabled={payOrder.isPending}
                                className="w-full bg-black px-5 py-3 font-beatrice text-[14px] font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                            >
                                {payOrder.isPending ? t('redirecting') : tt('payNow')}
                            </button>
                        )}
                        <button
                            onClick={handleReorder}
                            disabled={reorder.isPending}
                            className="w-full border border-black px-5 py-3 font-beatrice text-[14px] font-semibold text-black hover:bg-gray-50 disabled:opacity-50"
                        >
                            {reorder.isPending ? tc('loading') : tt('reorder')}
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}
