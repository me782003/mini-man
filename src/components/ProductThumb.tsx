'use client';

import { useState } from 'react';

/**
 * Product photo for small slots (cart, checkout, favourites, order details).
 * The photo keeps its real colours (no blend modes); a blurred copy behind it fills the
 * frame, so any background or aspect ratio fits without grey bars or cropping.
 */
export default function ProductThumb({ src, alt, className = '' }: { src: string | null | undefined; alt: string; className?: string }) {
    const [failed, setFailed] = useState(false);
    const url = !src || failed ? '/images/logo.png' : src;

    return (
        <div className={`relative shrink-0 overflow-hidden bg-[#e8e8e8] ${className}`}>
            {!failed && src && (
                // eslint-disable-next-line @next/next/no-img-element -- remote product photos of unknown size
                <img src={url} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover blur-md" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element -- remote product photos of unknown size */}
            <img
                src={url}
                alt={alt}
                onError={() => setFailed(true)}
                className={`relative h-full w-full object-contain ${failed || !src ? 'p-4 opacity-20' : ''}`}
            />
        </div>
    );
}
