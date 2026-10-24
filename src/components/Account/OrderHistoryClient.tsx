'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CalendarDays, Search, Store, Truck, X } from 'lucide-react';
import DateRangeSheet from './DateRangeSheet';
import { Link, useRouter } from '@/i18n/navigation';
import { ApiError } from '@/lib/fetcher';
import { useAuthModal } from '@/lib/context/AuthModalContext';
import {
    useOrders,
    useAbandonedOrders,
    usePayOrder,
    redirectToPayment,
    type AbandonedOrder,
    type OrderStatus,
} from '@/lib/hooks/useOrders';
import { intlLocale } from '@/lib/intl';
import { OrderStatusBadge } from '@/components/Orders/StatusBadge';
import { useScrollFade } from '@/lib/hooks/useScrollFade';

const PAGE_SIZE = 10;

const PAYMENT_METHOD_KEYS: Record<string, 'cod' | 'online' | 'branch'> = {
    cash_on_delivery: 'cod',
    cash: 'cod',
    paymob: 'online',
    branch_pickup: 'branch',
};

// Status tabs map to the API's `status` filter; "awaiting" lists unpaid online orders instead.
const TABS = ['all', 'processing', 'shipped', 'delivered', 'cancelled', 'awaiting'] as const;
type Tab = (typeof TABS)[number];

function formatDate(dateStr: string, locale: string) {
    return new Date(dateStr.replace(' ', 'T')).toLocaleDateString(intlLocale(locale), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function OrderHistoryClient() {
    const t = useTranslations('Orders');
    const tb = useTranslations('Branches');
    const tt = useTranslations('Tracking');
    const ta = useTranslations('Account');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const tab: Tab = (TABS as readonly string[]).includes(tabParam ?? '') ? (tabParam as Tab) : 'all';
    const qc = useQueryClient();

    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [dateSheetOpen, setDateSheetOpen] = useState(false);
    const dateFilterActive = !!fromDate && !!toDate;
    const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [tabsRef, tabsFade] = useScrollFade<HTMLDivElement>();

    const ordersQuery = useOrders({
        page,
        limit: PAGE_SIZE,
        status: tab === 'all' || tab === 'awaiting' ? undefined : (tab as OrderStatus),
        search,
        from_date: fromDate,
        to_date: toDate,
    });
    const orders = ordersQuery.data?.data ?? [];
    const totalPages = ordersQuery.data?.pagination?.total_pages ?? 1;

    const [awaitingPage, setAwaitingPage] = useState(1);
    const abandoned = useAbandonedOrders(awaitingPage);
    const awaitingTotal = abandoned.data?.pagination?.total ?? abandoned.data?.data.length ?? 0;

    // Customers land here after Paymob. The webhook confirms payments server-side,
    // so always start from fresh cart / orders / awaiting-payment data.
    useEffect(() => {
        qc.invalidateQueries({ queryKey: ['cart'] });
        qc.invalidateQueries({ queryKey: ['orders'] });
    }, [qc]);

    const selectTab = (next: Tab) => {
        setPage(1);
        router.replace(next === 'all' ? '/account/orders' : `/account/orders?tab=${next}`, { scroll: false });
    };

    const onSearchChange = (value: string) => {
        setSearchInput(value);
        if (debounce.current) clearTimeout(debounce.current);
        debounce.current = setTimeout(() => { setSearch(value); setPage(1); }, 400);
    };

    const hasFilters = !!search || !!fromDate || !!toDate;
    const clearFilters = () => {
        setSearchInput(''); setSearch(''); setFromDate(''); setToDate(''); setPage(1);
    };

    const tabLabel = (key: Tab) =>
        key === 'all' ? tt('tabAll') : key === 'awaiting' ? tt('pendingPayment') : tt(`status_${key}`);

    return (
        <>
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">{tc('home')}</Link>
                <span>/</span>
                <Link href="/account" className="transition-colors hover:text-black">{tc('account')}</Link>
                <span>/</span>
                <span className="font-semibold text-black">{ta('orderHistory')}</span>
            </nav>

            <p className="font-beatrice text-[20px] font-bold uppercase text-black">{tc('account')}</p>

            <h1 className="mt-8 font-beatrice text-[30px] font-bold leading-tight text-black sm:mt-10 sm:text-[42px]">
                {ta('orderHistory')}
            </h1>

            <p className="mt-2 mb-6 font-beatrice text-[13px] text-gray-500 sm:mb-7 sm:text-[14px]">
                {ta('orderHistoryHint')}
            </p>

            {/* Tabs (scroll sideways on small screens) */}
            <div ref={tabsRef} style={tabsFade} role="tablist" className="no-scrollbar mb-5 flex gap-5 overflow-x-auto border-b border-gray-200">
                {TABS.map(key => (
                    <button
                        key={key}
                        role="tab"
                        aria-selected={tab === key}
                        onClick={() => selectTab(key)}
                        className={`shrink-0 whitespace-nowrap border-b-2 px-1 pb-3 font-beatrice text-[14px] font-semibold transition-colors ${tab === key ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
                    >
                        {tabLabel(key)}
                        {key === 'awaiting' && awaitingTotal > 0 && (
                            <span className="ms-2 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] text-white">
                                {awaitingTotal.toLocaleString(intlLocale(locale))}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {tab === 'awaiting' ? (
                <AwaitingPaymentList
                    orders={abandoned.data?.data ?? []}
                    isLoading={abandoned.isPending}
                    page={awaitingPage}
                    totalPages={abandoned.data?.pagination?.total_pages ?? 1}
                    onPageChange={setAwaitingPage}
                />
            ) : (
                <>
                    {/* Search + date range */}
                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end">
                        <div className="flex items-stretch gap-2 md:flex-1">
                        <label className="relative flex-1">
                            <span className="sr-only">{tt('searchOrders')}</span>
                            <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                value={searchInput}
                                onChange={e => onSearchChange(e.target.value)}
                                placeholder={tt('searchOrders')}
                                className="w-full rounded-lg border border-gray-300 py-2.5 pe-3 ps-9 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                            />
                        </label>
                        {/* Mobile: date filter lives in a bottom sheet behind this button. */}
                        <button
                            type="button"
                            onClick={() => setDateSheetOpen(true)}
                            aria-label={tt('filterByDate')}
                            aria-haspopup="dialog"
                            className={`relative flex w-11 shrink-0 items-center justify-center rounded-lg border transition-colors md:hidden ${dateFilterActive ? 'border-black text-black' : 'border-gray-300 text-gray-600'}`}
                        >
                            <CalendarDays size={19} aria-hidden />
                            {dateFilterActive && (
                                <span aria-hidden className="absolute -end-1 -top-1 h-2.5 w-2.5 rounded-full bg-black ring-2 ring-white" />
                            )}
                        </button>
                        </div>
                        {/* Desktop / tablet: inline date fields. */}
                        <div className="hidden flex-wrap items-end gap-2 md:flex">
                            <label className="font-beatrice text-[12px] text-gray-500">
                                {tt('fromDate')}
                                <input
                                    type="date"
                                    value={fromDate}
                                    max={toDate || undefined}
                                    onChange={e => { setFromDate(e.target.value); setPage(1); }}
                                    className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-black focus:border-black focus:outline-none"
                                />
                            </label>
                            <label className="font-beatrice text-[12px] text-gray-500">
                                {tt('toDate')}
                                <input
                                    type="date"
                                    value={toDate}
                                    min={fromDate || undefined}
                                    onChange={e => { setToDate(e.target.value); setPage(1); }}
                                    className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-[14px] text-black focus:border-black focus:outline-none"
                                />
                            </label>
                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-1 px-2 py-2 font-beatrice text-[13px] font-semibold text-gray-500 hover:text-black"
                                >
                                    <X size={14} /> {tt('clearFilters')}
                                </button>
                            )}
                        </div>
                    </div>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="-mt-2 mb-4 inline-flex items-center gap-1 font-beatrice text-[13px] font-semibold text-gray-500 hover:text-black md:hidden"
                        >
                            <X size={14} /> {tt('clearFilters')}
                        </button>
                    )}
                    {dateSheetOpen && (
                        <DateRangeSheet
                            from={fromDate}
                            to={toDate}
                            onApply={(f, t) => { setFromDate(f); setToDate(t); setPage(1); }}
                            onClose={() => setDateSheetOpen(false)}
                        />
                    )}
                    {(fromDate && !toDate) || (!fromDate && toDate) ? (
                        <p className="-mt-3 mb-4 font-beatrice text-[12px] text-gray-500">{tt('bothDatesNeeded')}</p>
                    ) : null}

                    {ordersQuery.isPending ? (
                        <OrdersSkeleton />
                    ) : ordersQuery.isError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-5 font-beatrice text-[14px] text-red-600">
                            <p>{tt('loadError')}</p>
                            <button onClick={() => ordersQuery.refetch()} className="mt-2 font-semibold text-black underline underline-offset-2">
                                {tt('retry')}
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-center">
                            <p className="font-beatrice text-[15px] text-gray-500">
                                {hasFilters || tab !== 'all' ? tt('noMatches') : tt('noOrders')}
                            </p>
                            {!hasFilters && tab === 'all' && (
                                <Link href="/products" className="mt-4 bg-black px-6 py-3 font-beatrice text-[14px] font-semibold text-white hover:bg-neutral-800">
                                    {t('continueShopping')}
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className={`space-y-4 transition-opacity ${ordersQuery.isFetching ? 'opacity-60' : ''}`}>
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    className="flex flex-col gap-4 rounded-lg border border-gray-200 px-4 py-5 sm:px-6 md:px-8 md:py-6 lg:flex-row lg:items-center lg:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <span className="font-beatrice text-[18px] font-semibold text-black sm:text-[20px]">
                                                {t('orderTitle', { id: order.id })}
                                            </span>
                                            <OrderStatusBadge status={order.current_status} />
                                            {order.payment_method === 'branch_pickup' ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-beatrice text-[12px] font-semibold text-gray-700">
                                                    <Store size={13} aria-hidden /> {tb('pickup')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-beatrice text-[12px] font-semibold text-gray-700">
                                                    <Truck size={13} aria-hidden /> {tb('delivery')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 font-beatrice text-[13px] leading-relaxed text-gray-500">
                                            <span>{formatDate(order.created_at, locale)}</span>
                                            <span className="mx-2">·</span>
                                            <span>{PAYMENT_METHOD_KEYS[order.payment_method] ? t(PAYMENT_METHOD_KEYS[order.payment_method]) : order.payment_method}</span>
                                            <span className="mx-2">·</span>
                                            <span className="font-semibold text-black">
                                                {tc('currency', { amount: parseFloat(order.total_amount).toLocaleString(intlLocale(locale), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Side by side, sharing the width on phones. */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/account/orders/${order.id}/tracking`}
                                            className="inline-flex flex-1 items-center justify-center whitespace-nowrap bg-black px-3 py-3 font-beatrice text-[14px] font-medium text-white transition-colors hover:bg-neutral-800 sm:flex-none sm:px-6"
                                        >
                                            {t('trackOrder')}
                                        </Link>
                                        <Link
                                            href={`/account/orders/${order.id}`}
                                            className="inline-flex flex-1 items-center justify-center whitespace-nowrap border border-gray-300 px-3 py-3 font-beatrice text-[14px] font-medium text-black transition-colors hover:bg-gray-50 sm:flex-none sm:px-6"
                                        >
                                            {ta('viewDetails')}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            <Pager page={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    )}
                </>
            )}
        </>
    );
}

function OrdersSkeleton() {
    return (
        <div className="space-y-4" aria-hidden>
            {[0, 1, 2].map(i => (
                <div key={i} className="space-y-2 rounded-lg border border-gray-200 p-6">
                    <div className="h-5 w-1/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
            ))}
        </div>
    );
}

function Pager({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
    const ta = useTranslations('Account');
    const locale = useLocale();
    if (totalPages <= 1) return null;
    const n = (v: number) => v.toLocaleString(intlLocale(locale));
    return (
        <div className="mt-6 flex items-center justify-center gap-4 font-beatrice text-[14px]">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-md border border-gray-300 px-4 py-2 disabled:opacity-40"
                aria-label={ta('previousPage')}
            >
                <span className="rtl:hidden">←</span><span className="ltr:hidden">→</span>
            </button>
            <span>{n(page)} / {n(totalPages)}</span>
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-md border border-gray-300 px-4 py-2 disabled:opacity-40"
                aria-label={ta('nextPage')}
            >
                <span className="rtl:hidden">→</span><span className="ltr:hidden">←</span>
            </button>
        </div>
    );
}

function AwaitingPaymentList({
    orders, isLoading, page, totalPages, onPageChange,
}: {
    orders: AbandonedOrder[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    const t = useTranslations('Orders');
    const tt = useTranslations('Tracking');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const payOrder = usePayOrder();
    const { openAuthModal } = useAuthModal();
    const [payingId, setPayingId] = useState<number | null>(null);

    const completePayment = (orderId: number) => {
        setPayingId(orderId);
        payOrder.mutate(orderId, {
            onSuccess: ({ data, message }) => {
                if (data.redirect_to_payment && data.payment_url) {
                    // Keep the button busy until the browser leaves the page.
                    redirectToPayment(data.payment_url);
                    return;
                }
                setPayingId(null);
                toast.error(message);
            },
            onError: (err: Error) => {
                setPayingId(null);
                if (err instanceof ApiError && err.status === 401) {
                    openAuthModal(() => completePayment(orderId));
                    return;
                }
                // 400: already paid / cancelled — usePayOrder refreshes both lists.
                toast.error(err.message);
            },
        });
    };

    if (isLoading) return <OrdersSkeleton />;

    if (orders.length === 0) {
        return <p className="py-16 text-center font-beatrice text-[15px] text-gray-400">{t('noAwaitingPayment')}</p>;
    }

    return (
        <>
            <p className="mb-4 font-beatrice text-[13px] text-gray-500">{t('awaitingPaymentHint')}</p>
            <div className="space-y-4">
                {orders.map(order => (
                    <div
                        key={order.id}
                        className="flex flex-col gap-4 rounded-lg border border-amber-200 bg-amber-50/40 px-4 py-5 sm:px-6 md:px-8 md:py-6 lg:flex-row lg:items-center lg:justify-between"
                    >
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <span className="font-beatrice text-[18px] font-semibold text-black sm:text-[20px]">
                                    {t('orderTitle', { id: order.id })}
                                </span>
                                <span
                                    className={`rounded-full px-3 py-1 font-beatrice text-[12px] font-semibold ${order.abandon_reason === 'payment_failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}
                                >
                                    {order.abandon_reason === 'payment_failed' ? t('paymentFailed') : t('paymentNotCompleted')}
                                </span>
                            </div>
                            <p className="mt-1 font-beatrice text-[13px] leading-relaxed text-gray-500">
                                <span>{formatDate(order.created_at, locale)}</span>
                                <span className="mx-2">·</span>
                                <span className="font-semibold text-black">
                                    {tc('currency', { amount: parseFloat(order.total_amount).toLocaleString(intlLocale(locale), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
                                </span>
                            </p>
                        </div>

                        {order.can_pay && (
                            <button
                                onClick={() => completePayment(order.id)}
                                disabled={payingId !== null}
                                className="inline-flex w-full items-center justify-center bg-black px-5 py-3 font-beatrice text-[14px] font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 sm:w-auto sm:px-6"
                            >
                                {payingId === order.id ? t('redirecting') : tt('payNow')}
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <Pager page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </>
    );
}
