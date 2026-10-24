'use client';

import React from 'react';
import { useScrollFade } from '@/lib/hooks/useScrollFade';

/** A horizontally scrolling row whose edges fade where more content is hidden. Usable from server components. */
export default function ScrollFadeRow({ children, className = '', ...props }: React.HTMLAttributes<HTMLElement>) {
    const [ref, fadeStyle] = useScrollFade();
    return (
        <nav ref={ref} {...props} className={`no-scrollbar overflow-x-auto ${className}`} style={{ ...props.style, ...fadeStyle }}>
            {children}
        </nav>
    );
}
