'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
    Bike,
    Check,
    ChevronDown,
    CircleCheckBig,
    CircleX,
    Copy,
    CreditCard,
    ExternalLink,
    HandCoins,
    MessageCircle,
    Package,
    PackageOpen,
    Phone,
    Receipt,
    RefreshCw,
    Store,
    TriangleAlert,
    Truck,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import BranchCard, { BranchActions, useBranchName } from '@/components/Orders/BranchCard';
import { OrderStatusBadge } from '@/components/Orders/StatusBadge';
import { useSettings } from '@/lib/hooks/useSettings';
import type { OrderTracking as OrderTrackingData, TrackingShipment, TrackingStage } from '@/lib/hooks/useOrders';
import { intlLocale } from '@/lib/intl';

// `key` only picks the icon — titles come localized from the server.
const STAGE_ICONS: Record<string, React.ElementType> = {
    order_placed: Receipt,
    payment_confirmed: CreditCard,
    shipment_created: Package,
    preparing: PackageOpen,
    picked_up: HandCoins,
    in_transit: Truck,
    out_for_delivery: Bike,
    delivered: CircleCheckBig,
    collected: CircleCheckBig,
    ready_for_pickup: Store,
};

// Bosta codes: returned, terminated/cancelled, lost/damaged → red; the rest (47, 102, 103, 105…) → orange.
const ERROR_ISSUE_CODES = new Set([46, 60, 48, 49, 100, 101]);
const DELIVERY_EXCEPTION = 47;

/**
 * Server dates are store-local ("2026-10-20 14:35:10", no timezone). Parsing without a zone keeps
 * the same wall-clock time, so it's shown exactly as sent — only formatted for the language.
 */
export function formatTrackingDate(value: string, locale: string) {
    const date = new Date(value.replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(intlLocale(locale), {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

interface OrderTrackingProps {
    tracking: OrderTrackingData;
    orderId: string;
    onRefresh: () => void;
    refreshing: boolean;
    /** When the data was last fetched (ms). */
    updatedAt: number;
}

/** The tracking page body: summary, alerts, the stage timeline, and shipment / pickup / help cards. */
export default function OrderTracking({ tracking, orderId, onRefresh, refreshing, updatedAt }: OrderTrackingProps) {
    const t = useTranslations('Tracking');
    const to = useTranslations('Orders');
    const tb = useTranslations('Branches');
    const locale = useLocale();
    const branchName = useBranchName();
    const isPickup = tracking.delivery_type === 'branch_pickup';
    const stageOf = (key: string) => tracking.stages.find(s => s.key === key);
    const readyForPickup = isPickup && !tracking.cancelled && stageOf('ready_for_pickup')?.status === 'current';
    const collected = isPickup && !tracking.cancelled && stageOf('collected')?.status === 'done' ? stageOf('collected') : undefined;

    return (
        <div className="space-y-5">
            <SummaryCard tracking={tracking} orderId={orderId} onRefresh={onRefresh} refreshing={refreshing} updatedAt={updatedAt} />

            {/* Alerts */}
            {tracking.cancelled && (
                <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                    <CircleX size={22} className="shrink-0 text-red-600" />
                    <p className="font-beatrice text-[15px] font-semibold text-red-700">{t('cancelledBanner')}</p>
                </div>
            )}
            {tracking.issue && <IssueBanner issue={tracking.issue} />}
            {readyForPickup && (
                <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <Store size={22} className="shrink-0 text-green-700" />
                        <p className="font-beatrice text-[15px] font-semibold text-green-800">
                            {tracking.pickup_branch ? tb('readyAt', { name: branchName(tracking.pickup_branch) }) : t('readyForPickup')}
                        </p>
                    </div>
                    {tracking.pickup_branch && <BranchActions branch={tracking.pickup_branch} className="mt-3 ps-9" small />}
                </div>
            )}
            {collected && (
                <p className="flex items-center gap-2 rounded-xl bg-green-50 px-5 py-3 font-beatrice text-[14px] font-medium text-green-800">
                    <CircleCheckBig size={18} className="shrink-0" />
                    {collected.date ? tb('collectedOn', { date: formatTrackingDate(collected.date, locale) }) : tb('collected')}
                </p>
            )}

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
                {/* Main: timeline + Bosta updates */}
                <div className="space-y-5">
                    <section aria-labelledby="timeline-heading" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
                        <h2 id="timeline-heading" className="mb-6 font-beatrice text-[17px] font-bold text-black">{t('timeline')}</h2>
                        <StageTimeline stages={tracking.stages} cancelled={tracking.cancelled} locale={locale} />
                    </section>
                    {tracking.events.length > 0 && <ShippingUpdates events={tracking.events} locale={locale} />}
                </div>

                {/* Side: shipment / pickup branch, help */}
                <aside className="space-y-5 lg:sticky lg:top-[calc(var(--header-h,7rem)+1.5rem)]">
                    {isPickup && tracking.pickup_branch ? (
                        <section className="rounded-2xl border border-gray-200 bg-white p-5">
                            <h2 className="mb-3 font-beatrice text-[15px] font-bold text-black">{to('pickupBranch')}</h2>
                            <BranchCard branch={tracking.pickup_branch} variant="compact" />
                            <p className="mt-3 font-beatrice text-[13px] text-gray-500">{to('payAtBranch')}</p>
                        </section>
                    ) : tracking.shipment ? (
                        <ShipmentCard shipment={tracking.shipment} />
                    ) : !tracking.cancelled ? (
                        <section className="flex items-start gap-3 rounded-2xl border border-dashed border-gray-300 p-5">
                            <Package size={20} className="mt-0.5 shrink-0 text-gray-400" />
                            <p className="font-beatrice text-[14px] text-gray-600">{t('preparingShipment')}</p>
                        </section>
                    ) : null}
                    <HelpCard />
                    <Link
                        href={`/account/orders/${orderId}`}
                        className="block text-center font-beatrice text-[14px] font-semibold text-black underline underline-offset-4 hover:text-gray-600"
                    >
                        {t('viewOrderDetails')}
                    </Link>
                </aside>
            </div>
        </div>
    );
}

/* ── Summary ──────────────────────────────────────────────────────────────── */

function SummaryCard({ tracking, orderId, onRefresh, refreshing, updatedAt }: OrderTrackingProps) {
    const t = useTranslations('Tracking');
    const to = useTranslations('Orders');
    const locale = useLocale();
    const isPickup = tracking.delivery_type === 'branch_pickup';
    const total = tracking.stages.length;
    const done = tracking.stages.filter(s => s.status === 'done').length;
    const current = tracking.stages.find(s => s.status === 'current');
    const last = tracking.stages[total - 1];
    const finished = last?.status === 'done';
    // Progress counts the current stage as half-way there.
    const progress = total ? Math.round(((done + (current ? 0.5 : 0)) / total) * 100) : 0;
    const headline = tracking.cancelled ? t('cancelledBanner') : finished ? last.title : current?.title ?? tracking.stages[0]?.title;
    const time = new Date(updatedAt).toLocaleTimeString(intlLocale(locale), { hour: 'numeric', minute: '2-digit' });
    const n = (v: number) => v.toLocaleString(intlLocale(locale));

    return (
        <section className="overflow-hidden rounded-2xl bg-neutral-950 text-white">
            <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-beatrice text-[13px] font-medium text-white/60">{to('orderTitle', { id: orderId })}</span>
                    <OrderStatusBadge status={tracking.order_status} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-beatrice text-[12px] font-semibold text-white/80">
                        {isPickup ? <Store size={13} aria-hidden /> : <Truck size={13} aria-hidden />}
                        {isPickup ? t('typePickup') : t('typeDelivery')}
                    </span>
                </div>

                <p className="mt-4 font-beatrice text-[12px] font-semibold uppercase tracking-wider text-white/50">{t('currentStatus')}</p>
                <p className={`mt-1 font-beatrice text-[24px] font-bold leading-tight sm:text-[30px] ${tracking.cancelled ? 'text-red-300' : ''}`}>
                    {headline}
                </p>

                {!tracking.cancelled && total > 0 && (
                    <div className="mt-5">
                        <div
                            className="h-2 w-full overflow-hidden rounded-full bg-white/15"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progress}
                            aria-label={t('progressLabel')}
                        >
                            <div
                                className={`h-full rounded-full transition-[width] duration-700 ease-out ${finished ? 'bg-[#6aaa84]' : 'bg-white'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="mt-2 font-beatrice text-[12px] text-white/60">{t('stepsDone', { done: n(done), total: n(total) })}</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-3 sm:px-7">
                <span className="font-beatrice text-[12px] text-white/50">{t('lastUpdated', { time })}</span>
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-beatrice text-[12px] font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:opacity-60"
                >
                    <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} aria-hidden />
                    {to('refresh')}
                </button>
            </div>
        </section>
    );
}

/* ── Timeline ─────────────────────────────────────────────────────────────── */

function StageTimeline({ stages, cancelled, locale }: { stages: TrackingStage[]; cancelled: boolean; locale: string }) {
    const t = useTranslations('Tracking');
    const stateLabel = { done: t('stepDone'), current: t('stepCurrent'), pending: t('stepPending') };

    return (
        <ol aria-label={t('timeline')}>
            {stages.map((stage, i) => {
                // A cancelled order greys everything out and has no "current" step.
                const status = cancelled ? 'pending' : stage.status;
                const Icon = status === 'done' ? Check : STAGE_ICONS[stage.key] ?? Package;
                const isLast = i === stages.length - 1;
                const nextReached = !cancelled && !isLast && stages[i + 1].status !== 'pending';
                const date = stage.date && stage.status !== 'pending' ? formatTrackingDate(stage.date, locale) : null;
                const label = [stage.title, stateLabel[status], date].filter(Boolean).join(', ');

                const circle =
                    status === 'done'
                        ? 'bg-[#6aaa84] text-white'
                        : status === 'current'
                            ? 'bg-black text-white'
                            : 'border-2 border-gray-200 bg-white text-gray-300';

                return (
                    <li key={stage.key} aria-label={label} aria-current={status === 'current' ? 'step' : undefined} className="relative flex gap-4 pb-7 last:pb-0">
                        {/* Rail to the next stage: solid once reached, dashed towards what's ahead. */}
                        {!isLast && (
                            <span
                                aria-hidden
                                className={`absolute bottom-0 start-[19px] top-11 border-s-2 ${nextReached ? 'border-solid border-[#6aaa84]' : 'border-dashed border-gray-200'}`}
                            />
                        )}
                        <span aria-hidden className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center">
                            {status === 'current' && <span className="absolute inset-0 rounded-full bg-black/20 motion-safe:animate-ping" />}
                            <span className={`relative flex h-10 w-10 items-center justify-center rounded-full ${circle}`}>
                                <Icon size={18} strokeWidth={2.2} />
                            </span>
                        </span>
                        <div aria-hidden className="min-w-0 flex-1 pt-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className={`font-beatrice text-[15px] leading-snug ${status === 'pending' ? 'text-gray-400' : status === 'current' ? 'font-bold text-black' : 'font-medium text-black'}`}>
                                    {stage.title}
                                </p>
                                {status === 'current' && (
                                    <span className="rounded-full bg-black px-2 py-0.5 font-beatrice text-[10px] font-bold uppercase tracking-wide text-white">
                                        {t('now')}
                                    </span>
                                )}
                            </div>
                            {date && <p className="mt-0.5 font-beatrice text-[12px] text-gray-500">{date}</p>}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

/* ── Cards ────────────────────────────────────────────────────────────────── */

function IssueBanner({ issue }: { issue: NonNullable<OrderTrackingData['issue']> }) {
    const t = useTranslations('Tracking');
    const isError = ERROR_ISSUE_CODES.has(issue.code);
    return (
        <div role="alert" className={`flex items-start gap-3 rounded-xl border px-5 py-4 ${isError ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
            <TriangleAlert size={22} className={`mt-0.5 shrink-0 ${isError ? 'text-red-600' : 'text-orange-600'}`} />
            <div className={`font-beatrice ${isError ? 'text-red-800' : 'text-orange-800'}`}>
                <p className="text-[15px] font-semibold">{issue.title}</p>
                {issue.reason && <p className="mt-1 text-[14px]">{issue.reason}</p>}
                <p className="mt-2 text-[13px]">{issue.code === DELIVERY_EXCEPTION ? t('retryOrContact') : t('contactUs')}</p>
            </div>
        </div>
    );
}

function ShipmentCard({ shipment }: { shipment: TrackingShipment }) {
    const t = useTranslations('Tracking');
    const to = useTranslations('Orders');
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(shipment.tracking_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard blocked (e.g. insecure context) — the number stays selectable.
        }
    };

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="font-beatrice text-[15px] font-bold text-black">{to('shipment')}</h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-beatrice text-[11px] font-semibold text-indigo-700">
                    {shipment.provider === 'bosta' ? 'Bosta' : shipment.provider}
                </span>
            </div>

            <p className="font-beatrice text-[12px] text-gray-500">{to('trackingNumber')}</p>
            <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
                <span dir="ltr" className="select-all font-beatrice text-[16px] font-bold tracking-wide text-black">{shipment.tracking_number}</span>
                <button
                    type="button"
                    onClick={copy}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-beatrice text-[12px] font-semibold text-gray-700 hover:bg-gray-200"
                    aria-label={to('copy')}
                >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? to('copied') : to('copy')}
                </button>
            </div>

            <p className="mt-4 font-beatrice text-[12px] text-gray-500">{to('shipmentStatus')}</p>
            <p className="mt-1 font-beatrice text-[14px] font-semibold text-black">{shipment.status}</p>
            {!shipment.is_active && <p className="mt-2 font-beatrice text-[12px] text-gray-500">{t('shipmentClosed')}</p>}

            {shipment.tracking_url && (
                <a
                    href={shipment.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-beatrice text-[14px] font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                    {to('trackOnBosta')}
                    <ExternalLink size={14} aria-hidden />
                </a>
            )}
        </section>
    );
}

function HelpCard() {
    const t = useTranslations('Tracking');
    const { data: settings } = useSettings();
    const phone = settings?.data.contacts.phone?.[0]?.value;
    const whatsappDigits = settings?.data.contacts.whatsapp?.value?.replace(/\D/g, '');
    if (!phone && !whatsappDigits) return null;

    return (
        <section className="rounded-2xl bg-gray-50 p-5">
            <h2 className="font-beatrice text-[15px] font-bold text-black">{t('needHelp')}</h2>
            <p className="mt-1 font-beatrice text-[13px] text-gray-500">{t('needHelpHint')}</p>
            <div className="mt-4 flex flex-col gap-2">
                {whatsappDigits && (
                    <a
                        href={`https://wa.me/${whatsappDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 font-beatrice text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        <MessageCircle size={16} aria-hidden /> {t('whatsapp')}
                    </a>
                )}
                {phone && (
                    <a
                        href={`tel:${phone.replace(/\s/g, '')}`}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-beatrice text-[14px] font-semibold text-black hover:border-black"
                    >
                        <Phone size={16} aria-hidden /> <span dir="ltr">{phone}</span>
                    </a>
                )}
            </div>
        </section>
    );
}

function ShippingUpdates({ events, locale }: { events: OrderTrackingData['events']; locale: string }) {
    const t = useTranslations('Tracking');
    const [open, setOpen] = useState(false);
    const id = 'shipping-updates';

    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
                aria-controls={id}
                className="flex w-full items-center justify-between px-5 py-4 font-beatrice text-[15px] font-bold text-black sm:px-7"
            >
                <span className="flex items-center gap-2">
                    {t('shippingUpdates')}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-semibold text-gray-600">{events.length.toLocaleString(intlLocale(locale))}</span>
                </span>
                <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <ol id={id} className="space-y-4 border-t border-gray-100 px-5 py-5 sm:px-7">
                    {events.map((event, i) => (
                        <li key={`${event.state_code}-${event.date}-${i}`} className="flex gap-3">
                            <span aria-hidden className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${i === 0 ? 'bg-black' : 'bg-gray-300'}`} />
                            <div className="font-beatrice">
                                <p className={`text-[14px] ${i === 0 ? 'font-semibold text-black' : 'text-gray-700'}`}>{event.title}</p>
                                {event.exception_reason && <p className="text-[13px] text-orange-600">{event.exception_reason}</p>}
                                <p className="text-[12px] text-gray-400">{formatTrackingDate(event.date, locale)}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
