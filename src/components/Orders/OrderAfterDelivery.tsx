'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Star, X } from 'lucide-react';
import {
    RETURN_REASONS,
    isEndpointMissing,
    useRequestReturn,
    useSubmitOrderReview,
    type OrderDetail,
    type OrderItem,
    type ReturnReason,
    type TrackingEntry,
} from '@/lib/hooks/useOrders';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';
import { intlLocale } from '@/lib/intl';

const DETAILS_MAX = 500;

/** Product reviews after delivery: off until the API has a review endpoint. */
export const REVIEWS_ENABLED = false;

/* ─── Status history with the store's notes ──────────────────────────── */

/** Every status change on the order, newest first, with the note the store wrote. */
export function OrderUpdates({ history }: { history: TrackingEntry[] }) {
    const t = useTranslations('Tracking');
    const locale = useLocale();
    if (!history?.length) return null;

    const entries = [...history].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const when = (d: string) =>
        new Date(d.replace(' ', 'T')).toLocaleString(intlLocale(locale), { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <section aria-labelledby="updates-heading" className="rounded-lg border border-gray-200 p-5 sm:p-6">
            <h2 id="updates-heading" className="mb-4 font-beatrice text-[16px] font-semibold text-black">{t('orderUpdates')}</h2>
            <ol className="relative space-y-5 border-s border-gray-200 ps-5">
                {entries.map((entry, i) => {
                    const key = `status_${entry.status}`;
                    return (
                        <li key={entry.id} className="relative">
                            <span
                                aria-hidden
                                className={`absolute -start-[26px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${i === 0 ? 'bg-black' : 'bg-gray-300'}`}
                            />
                            <p className="font-beatrice text-[14px] font-semibold text-black">
                                {t.has(key) ? t(key) : entry.status}
                            </p>
                            <p className="font-beatrice text-[12px] text-gray-500">{when(entry.created_at)}</p>
                            {entry.notes?.trim() && (
                                <p className="mt-2 whitespace-pre-line rounded-md bg-gray-50 px-3 py-2 font-beatrice text-[13px] text-gray-700">
                                    {entry.notes}
                                </p>
                            )}
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

/* ─── Shared modal shell ─────────────────────────────────────────────── */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    const tc = useTranslations('Common');
    useLockBodyScroll();
    if (typeof document === 'undefined') return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-[560px] overflow-y-auto bg-white p-5 sm:p-8">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <h2 className="font-beatrice text-[20px] font-bold text-black sm:text-[24px]">{title}</h2>
                    <button type="button" onClick={onClose} aria-label={tc('close')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body,
    );
}

/* ─── Return request ─────────────────────────────────────────────────── */

export function ReturnRequestButton({ order }: { order: OrderDetail }) {
    const t = useTranslations('Tracking');
    const locale = useLocale();
    const [open, setOpen] = useState(false);
    const existing = order.return_request;

    if (existing) {
        const key = `return_${existing.status}`;
        return (
            <div className="rounded-md bg-amber-50 px-3 py-2.5 font-beatrice text-[13px] text-amber-900">
                <p className="font-semibold">
                    {t('returnRequested')} · {t.has(key) ? t(key) : existing.status}
                </p>
                {existing.admin_note?.trim() && <p className="mt-1 whitespace-pre-line">{existing.admin_note}</p>}
            </div>
        );
    }

    if (!order.can_request_return) return null;

    const deadline = order.return_deadline
        ? new Date(order.return_deadline.replace(' ', 'T')).toLocaleDateString(intlLocale(locale), { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full border border-gray-300 px-5 py-3 font-beatrice text-[14px] font-semibold text-black hover:border-black"
            >
                {t('requestReturn')}
            </button>
            {deadline && <p className="text-center font-beatrice text-[12px] text-gray-500">{t('returnUntil', { date: deadline })}</p>}
            {open && <ReturnRequestModal order={order} onClose={() => setOpen(false)} />}
        </>
    );
}

function ReturnRequestModal({ order, onClose }: { order: OrderDetail; onClose: () => void }) {
    const t = useTranslations('Tracking');
    const tc = useTranslations('Common');
    const request = useRequestReturn(order.id);
    // Every item selected with its full quantity by default (= the whole order).
    const [qty, setQty] = useState<Record<number, number>>(() =>
        Object.fromEntries(order.items.map(i => [i.id, i.quantity])));
    const [reason, setReason] = useState<ReturnReason | ''>('');
    const [details, setDetails] = useState('');
    const [error, setError] = useState<string | null>(null);

    const selected = order.items.filter(i => (qty[i.id] ?? 0) > 0);
    const wholeOrder = selected.length === order.items.length && selected.every(i => qty[i.id] === i.quantity);

    const submit = () => {
        if (selected.length === 0) { setError(t('returnPickItems')); return; }
        if (!reason) { setError(t('returnPickReason')); return; }
        if (reason === 'other' && !details.trim()) { setError(t('returnDetailsRequired')); return; }
        setError(null);
        request.mutate(
            {
                reason,
                details: details.trim() || undefined,
                // Leave items out for the whole order.
                items: wholeOrder ? undefined : selected.map(i => ({ order_item_id: i.id, quantity: qty[i.id] })),
            },
            {
                onSuccess: () => { toast.success(t('returnSent')); onClose(); },
                onError: (err) => setError(err.message || tc('somethingWentWrong')),
            },
        );
    };
    return (
        <Modal title={t('requestReturn')} onClose={onClose}>
            <p className="mb-4 font-beatrice text-[13px] text-gray-500">{t('returnHint')}</p>

            <p className="mb-2 font-beatrice text-[14px] font-semibold text-black">{t('returnItems')}</p>
            <ul className="mb-5 divide-y divide-gray-100 border border-gray-200">
                {order.items.map(item => (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                        <label className="flex min-w-0 cursor-pointer items-center gap-2 font-beatrice text-[13px] text-black">
                            <input
                                type="checkbox"
                                checked={(qty[item.id] ?? 0) > 0}
                                onChange={e => setQty(q => ({ ...q, [item.id]: e.target.checked ? item.quantity : 0 }))}
                                className="h-4 w-4 accent-black"
                            />
                            <span className="truncate">{item.product_snapshot.name}</span>
                            {item.product_snapshot.variant_details?.size && (
                                <span className="shrink-0 text-gray-500">· {item.product_snapshot.variant_details.size}</span>
                            )}
                        </label>
                        {item.quantity > 1 && (qty[item.id] ?? 0) > 0 && (
                            <select
                                value={qty[item.id]}
                                onChange={e => setQty(q => ({ ...q, [item.id]: Number(e.target.value) }))}
                                aria-label={tc('qty')}
                                className="border border-gray-300 px-2 py-1 font-beatrice text-[13px]"
                            >
                                {Array.from({ length: item.quantity }, (_, n) => n + 1).map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        )}
                    </li>
                ))}
            </ul>

            <label htmlFor="return-reason" className="mb-2 block font-beatrice text-[14px] font-semibold text-black">{t('returnReason')}</label>
            <select
                id="return-reason"
                value={reason}
                onChange={e => setReason(e.target.value as ReturnReason)}
                className="mb-4 w-full border border-gray-300 bg-white px-3 py-3 font-beatrice text-[14px] focus:border-black focus:outline-none"
            >
                <option value="" disabled>{t('returnChooseReason')}</option>
                {RETURN_REASONS.map(r => <option key={r} value={r}>{t(`reason_${r}`)}</option>)}
            </select>

            <textarea
                value={details}
                onChange={e => setDetails(e.target.value.slice(0, DETAILS_MAX))}
                rows={3}
                placeholder={reason === 'other' ? t('returnDetailsRequiredPlaceholder') : t('returnDetailsPlaceholder')}
                className="mb-4 w-full resize-none border border-gray-300 px-3 py-2.5 font-beatrice text-[14px] focus:border-black focus:outline-none"
            />

            {error && <p role="alert" className="mb-3 font-beatrice text-[13px] text-red-600">{error}</p>}

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={submit}
                    disabled={request.isPending}
                    className="flex-1 bg-black px-5 py-3 font-beatrice text-[14px] font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                    {request.isPending ? tc('loading') : t('sendReturnRequest')}
                </button>
                <button type="button" onClick={onClose} className="border border-gray-300 px-5 py-3 font-beatrice text-[14px] font-semibold text-black hover:bg-gray-50">
                    {tc('cancel')}
                </button>
            </div>
        </Modal>
    );
}

/* ─── Product review ─────────────────────────────────────────────────── */

export function RateItemButton({ orderId, item }: { orderId: number; item: OrderItem }) {
    const t = useTranslations('Tracking');
    const [open, setOpen] = useState(false);
    const [done, setDone] = useState(false);

    if (!item.product_id) return null;
    if (done || item.is_reviewed === true || item.is_reviewed === 1) {
        return <span className="font-beatrice text-[12px] font-medium text-green-700">✓ {t('reviewed')}</span>;
    }

    return (
        <>
            <button
                type="button"
                onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
                className="inline-flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 font-beatrice text-[12px] font-semibold text-black hover:border-black"
            >
                <Star size={13} aria-hidden />
                {t('rateProduct')}
            </button>
            {open && (
                <ReviewModal
                    orderId={orderId}
                    item={item}
                    onClose={() => setOpen(false)}
                    onDone={() => { setDone(true); setOpen(false); }}
                />
            )}
        </>
    );
}

function ReviewModal({ orderId, item, onClose, onDone }: { orderId: number; item: OrderItem; onClose: () => void; onDone: () => void }) {
    const t = useTranslations('Tracking');
    const tc = useTranslations('Common');
    const review = useSubmitOrderReview();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);

    const submit = () => {
        if (rating < 1) { setError(t('reviewPickRating')); return; }
        setError(null);
        review.mutate(
            { order_id: orderId, product_id: item.product_id!, rating, comment: comment.trim() || undefined },
            {
                onSuccess: () => { toast.success(t('reviewThanks')); onDone(); },
                onError: (err) => setError(isEndpointMissing(err) ? t('reviewUnavailable') : err.message || tc('somethingWentWrong')),
            },
        );
    };

    const shown = hover || rating;

    return (
        <Modal title={t('rateProduct')} onClose={onClose}>
            <p className="mb-4 font-beatrice text-[14px] font-medium text-black">{item.product_snapshot.name}</p>
            <div dir="ltr" className="mb-5 flex justify-center gap-2" role="radiogroup" aria-label={t('yourRating')} onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map(n => (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={t('stars', { n })}
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHover(n)}
                        className="p-1"
                    >
                        <Star size={32} className={n <= shown ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                    </button>
                ))}
            </div>
            <textarea
                value={comment}
                onChange={e => setComment(e.target.value.slice(0, DETAILS_MAX))}
                rows={4}
                placeholder={t('reviewPlaceholder')}
                className="mb-4 w-full resize-none border border-gray-300 px-3 py-2.5 font-beatrice text-[14px] focus:border-black focus:outline-none"
            />
            {error && <p role="alert" className="mb-3 font-beatrice text-[13px] text-red-600">{error}</p>}
            <button
                type="button"
                onClick={submit}
                disabled={review.isPending}
                className="w-full bg-black px-5 py-3 font-beatrice text-[14px] font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
            >
                {review.isPending ? tc('loading') : t('submitReview')}
            </button>
        </Modal>
    );
}
