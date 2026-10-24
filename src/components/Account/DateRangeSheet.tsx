'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';

interface DateRangeSheetProps {
    from: string;
    to: string;
    onApply: (from: string, to: string) => void;
    onClose: () => void;
}

// Local calendar date as YYYY-MM-DD (what <input type="date"> and the API expect).
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function lastDays(days: number): [string, string] {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));
    return [iso(from), iso(to)];
}

const PRESETS = [
    { key: 'last7', days: 7 },
    { key: 'last30', days: 30 },
    { key: 'last90', days: 90 },
] as const;

const CLOSE_MS = 220;
const DISMISS_DISTANCE = 110; // px dragged down
const DISMISS_VELOCITY = 0.6; // px per ms (a quick flick)

// Fixed 44px height: with appearance-none, iOS collapses an empty date field to almost nothing.
const dateInputClass =
    'mt-1 block h-11 min-h-[44px] w-full min-w-0 appearance-none rounded-lg border border-gray-300 bg-white px-3 text-start text-[14px] leading-[44px] text-black focus:border-black focus:outline-none [&::-webkit-date-and-time-value]:text-start [&::-webkit-date-and-time-value]:leading-[42px]';

/** Mobile bottom sheet for the orders date filter: quick ranges or a custom from/to. Drag down to close. */
export default function DateRangeSheet({ from, to, onApply, onClose }: DateRangeSheetProps) {
    const tt = useTranslations('Tracking');
    // Edits stay local until "Apply".
    const [draftFrom, setDraftFrom] = useState(from);
    const [draftTo, setDraftTo] = useState(to);
    const [dragY, setDragY] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [closing, setClosing] = useState(false);
    const drag = useRef<{ startY: number; startT: number } | null>(null);
    useLockBodyScroll();

    // Every close slides the sheet down first.
    const close = (after?: () => void) => {
        if (closing) return;
        setClosing(true);
        setTimeout(() => { after?.(); onClose(); }, CLOSE_MS);
    };
    const closeRef = useRef(close);
    useEffect(() => { closeRef.current = close; });

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const onTouchStart = (e: React.TouchEvent) => {
        // Let fields and buttons work normally; drag from anywhere else on the sheet.
        if ((e.target as HTMLElement).closest('input, button, select, label')) return;
        drag.current = { startY: e.touches[0].clientY, startT: Date.now() };
        setDragging(true);
    };
    const onTouchMove = (e: React.TouchEvent) => {
        if (!drag.current) return;
        setDragY(Math.max(0, e.touches[0].clientY - drag.current.startY)); // only downwards
    };
    const onTouchEnd = () => {
        if (!drag.current) return;
        const velocity = dragY / Math.max(1, Date.now() - drag.current.startT);
        drag.current = null;
        setDragging(false);
        if (dragY > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) close();
        else setDragY(0); // spring back
    };

    const incomplete = (!!draftFrom) !== (!!draftTo);
    const activePreset = PRESETS.find(p => {
        const [f, t] = lastDays(p.days);
        return draftFrom === f && draftTo === t;
    })?.key;

    const panelTransform = closing ? 'translateY(100%)' : `translateY(${dragY}px)`;
    const backdropOpacity = closing ? 0 : Math.max(0, 1 - dragY / 400);

    return createPortal(
        <div className="fixed inset-0 z-[300] flex items-end" role="dialog" aria-modal="true" aria-labelledby="date-sheet-title">
            <div
                className="sheet-backdrop absolute inset-0 bg-black/40"
                style={{ opacity: backdropOpacity, transition: dragging ? 'none' : `opacity ${CLOSE_MS}ms ease-out` }}
                onClick={() => close()}
            />

            <div
                className="sheet-panel relative w-full touch-none rounded-t-2xl bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3 shadow-2xl"
                style={{
                    transform: panelTransform,
                    transition: dragging ? 'none' : `transform ${CLOSE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
            >
                {/* Drag handle (the whole sheet is draggable; this is the visual cue). */}
                <div aria-hidden className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-300" />

                <div className="mb-5 flex items-center justify-between">
                    <h2 id="date-sheet-title" className="font-beatrice text-[17px] font-bold text-black">{tt('filterByDate')}</h2>
                    <button type="button" onClick={() => close()} aria-label={tt('close')} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>

                {/* Quick ranges */}
                <div className="mb-5 flex flex-wrap gap-2">
                    {PRESETS.map(p => (
                        <button
                            key={p.key}
                            type="button"
                            onClick={() => { const [f, t] = lastDays(p.days); setDraftFrom(f); setDraftTo(t); }}
                            aria-pressed={activePreset === p.key}
                            className={`rounded-full border px-4 py-2 font-beatrice text-[13px] font-medium transition-colors ${activePreset === p.key ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-black'}`}
                        >
                            {tt(p.key)}
                        </button>
                    ))}
                </div>

                {/* Custom range — fields may shrink to their column (no overlap); stacked on very narrow phones. */}
                <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
                    <label className="min-w-0 font-beatrice text-[12px] font-medium text-gray-500">
                        {tt('fromDate')}
                        <input
                            type="date"
                            value={draftFrom}
                            max={draftTo || undefined}
                            onChange={e => setDraftFrom(e.target.value)}
                            className={dateInputClass}
                        />
                    </label>
                    <label className="min-w-0 font-beatrice text-[12px] font-medium text-gray-500">
                        {tt('toDate')}
                        <input
                            type="date"
                            value={draftTo}
                            min={draftFrom || undefined}
                            onChange={e => setDraftTo(e.target.value)}
                            className={dateInputClass}
                        />
                    </label>
                </div>
                {incomplete && <p className="mt-2 font-beatrice text-[12px] text-gray-500">{tt('bothDatesNeeded')}</p>}

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={() => close(() => onApply('', ''))}
                        className="flex-1 rounded-lg border border-gray-300 py-3 font-beatrice text-[14px] font-semibold text-black hover:border-black"
                    >
                        {tt('clearDates')}
                    </button>
                    <button
                        type="button"
                        disabled={incomplete}
                        onClick={() => close(() => onApply(draftFrom, draftTo))}
                        className="flex-1 rounded-lg bg-black py-3 font-beatrice text-[14px] font-semibold text-white hover:bg-neutral-800 disabled:opacity-40"
                    >
                        {tt('apply')}
                    </button>
                </div>
            </div>

            <style>{`
                .sheet-backdrop { animation: sheetFade 0.2s ease-out; }
                .sheet-panel { animation: sheetUp 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
                @keyframes sheetFade { from { opacity: 0; } to { opacity: 1; } }
                @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @media (prefers-reduced-motion: reduce) { .sheet-panel, .sheet-backdrop { animation: none; transition: none !important; } }
            `}</style>
        </div>,
        document.body,
    );
}
