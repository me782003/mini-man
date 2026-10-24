'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';

/**
 * Fades the edges of a horizontal scroller where more content is hidden, as a hint that it scrolls.
 * Uses a CSS mask, so it works on any background.
 *
 * Returns a callback ref (so it also works for rows that mount later, e.g. after a loading
 * skeleton) and a style for the scroll container.
 */
export function useScrollFade<T extends HTMLElement = HTMLElement>(fadeSize = 28): [(el: T | null) => void, CSSProperties] {
    const [el, setEl] = useState<T | null>(null);
    const [fade, setFade] = useState({ left: false, right: false });

    const update = useCallback(() => {
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        if (max <= 1) {
            setFade((f) => (f.left || f.right ? { left: false, right: false } : f));
            return;
        }
        // RTL scrollers report 0 at the start and negative values towards the end.
        const offset = Math.abs(el.scrollLeft);
        const atStart = offset <= 1;
        const atEnd = offset >= max - 1;
        const rtl = getComputedStyle(el).direction === 'rtl';
        const next = rtl ? { left: !atEnd, right: !atStart } : { left: !atStart, right: !atEnd };
        setFade((f) => (f.left === next.left && f.right === next.right ? f : next));
    }, [el]);

    useEffect(() => {
        if (!el) return;
        el.addEventListener('scroll', update, { passive: true });
        // Also does the first measurement: observers report once as soon as they start watching.
        const ro = new ResizeObserver(update);
        ro.observe(el);
        if (el.firstElementChild) ro.observe(el.firstElementChild);
        return () => {
            el.removeEventListener('scroll', update);
            ro.disconnect();
        };
    }, [el, update]);

    if (!fade.left && !fade.right) return [setEl, {}];
    const size = `${fadeSize}px`;
    const mask = `linear-gradient(to right, ${fade.left ? 'transparent' : '#000'} 0, #000 ${size}, #000 calc(100% - ${size}), ${fade.right ? 'transparent' : '#000'} 100%)`;
    return [setEl, { maskImage: mask, WebkitMaskImage: mask }];
}
