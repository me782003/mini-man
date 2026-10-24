'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';

/** Full-screen photo viewer: arrows, arrow keys, swipe, Esc to close. */
export default function BranchGallery({ images, startIndex = 0, title, onClose }: {
    images: string[];
    startIndex?: number;
    title: string;
    onClose: () => void;
}) {
    const t = useTranslations('Site');
    const tc = useTranslations('Common');
    const isRtl = useLocale() === 'ar';
    const [index, setIndex] = useState(startIndex);
    const touchX = useRef<number | null>(null);

    const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
    const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            // Arrow keys follow the reading direction.
            if (e.key === 'ArrowLeft') (isRtl ? next : prev)();
            if (e.key === 'ArrowRight') (isRtl ? prev : next)();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose, prev, next, isRtl]);
    useLockBodyScroll();

    if (images.length === 0) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
            onClick={onClose}
        >
            <button
                type="button"
                className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={onClose}
                aria-label={tc('close')}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                </svg>
            </button>
            <span className="absolute start-4 top-5 rounded-full bg-white/10 px-3 py-1 font-beatrice text-[12px] tabular-nums text-white/80">
                {index + 1} / {images.length}
            </span>

            <div
                className="relative mx-4 w-full max-w-4xl sm:mx-16"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                    if (touchX.current === null) return;
                    const dx = e.changedTouches[0].clientX - touchX.current;
                    touchX.current = null;
                    if (Math.abs(dx) < 40) return;
                    const forward = (dx < 0) !== isRtl;
                    (forward ? next : prev)();
                }}
            >
                <div className="relative aspect-[4/3] max-h-[80vh] w-full">
                    <Image src={images[index]} alt={t('imageAlt', { n: index + 1 })} fill className="object-contain" sizes="90vw" />
                </div>
            </div>

            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute start-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black shadow hover:bg-white"
                        aria-label={t('previousImage')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute end-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black shadow hover:bg-white"
                        aria-label={t('nextImage')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    );
}
