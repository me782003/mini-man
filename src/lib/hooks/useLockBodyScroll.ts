'use client';

import { useEffect } from 'react';

// Several overlays can be open at once (e.g. a modal over the mobile menu): unlock only when the last closes.
let locks = 0;
let saved: { htmlOverflow: string; bodyOverflow: string; bodyPaddingRight: string } | null = null;

/**
 * Stops the page behind an overlay from scrolling while `active` is true.
 * Locks <html> as well as <body>: html has `overflow-x: clip`, so body's overflow alone no longer
 * reaches the page scroller. Pads for the scrollbar so the layout doesn't jump sideways.
 */
export function useLockBodyScroll(active = true) {
    useEffect(() => {
        if (!active) return;
        const html = document.documentElement;
        const body = document.body;
        if (locks === 0) {
            const scrollbar = window.innerWidth - html.clientWidth;
            saved = { htmlOverflow: html.style.overflow, bodyOverflow: body.style.overflow, bodyPaddingRight: body.style.paddingRight };
            html.style.overflow = 'hidden';
            body.style.overflow = 'hidden';
            if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
        }
        locks += 1;
        return () => {
            locks -= 1;
            if (locks === 0 && saved) {
                html.style.overflow = saved.htmlOverflow;
                body.style.overflow = saved.bodyOverflow;
                body.style.paddingRight = saved.bodyPaddingRight;
                saved = null;
            }
        };
    }, [active]);
}
