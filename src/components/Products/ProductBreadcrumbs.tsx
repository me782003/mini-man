'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useScrollFade } from '@/lib/hooks/useScrollFade';

interface Crumb {
    label: string;
    url: string | null;
}

/**
 * One-line breadcrumb that swipes sideways when it doesn't fit (no wrapping onto a second line).
 * Starts scrolled to the end so the current product is visible; swipe back for the parents.
 */
export default function ProductBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
    const ref = useRef<HTMLElement | null>(null);
    const isRtl = useLocale() === 'ar';
    const [fadeRef, fadeStyle] = useScrollFade();
    const setRef = useCallback((el: HTMLElement | null) => { ref.current = el; fadeRef(el); }, [fadeRef]);

    useEffect(() => {
        const el = ref.current;
        if (!el || el.scrollWidth <= el.clientWidth) return;
        // In RTL the scroll origin is the right edge, so the "end" is a negative offset.
        el.scrollLeft = isRtl ? -el.scrollWidth : el.scrollWidth;
    }, [crumbs, isRtl]);

    if (crumbs.length === 0) return null;

    return (
        <nav
            ref={setRef}
            aria-label="Breadcrumb"
            className="no-scrollbar -mx-4 mb-6 overflow-x-auto overscroll-x-contain px-4 md:mx-0 md:px-0"
            style={fadeStyle}
        >
            <ol className="flex w-max items-center gap-1.5 whitespace-nowrap font-beatrice text-[12px] text-gray-500 md:w-auto md:flex-wrap md:whitespace-normal">
                {crumbs.map((crumb, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                        {i > 0 && <span aria-hidden className="text-gray-300">/</span>}
                        {crumb.url ? (
                            <Link href={crumb.url} className="transition-colors hover:text-black">
                                {crumb.label}
                            </Link>
                        ) : (
                            <span aria-current="page" className="font-semibold text-black">
                                {crumb.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
