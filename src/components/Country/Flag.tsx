'use client';

import { useState } from 'react';
import { flagEmoji } from '@/lib/countries';

/** Flag image, falling back to the emoji when there's no URL or it fails to load. */
export default function Flag({ code, flagUrl, className = 'h-4 w-6' }: { code: string; flagUrl?: string | null; className?: string }) {
    const [failed, setFailed] = useState(false);

    if (!flagUrl || failed) {
        return (
            <span aria-hidden className="inline-flex shrink-0 items-center justify-center text-[15px] leading-none">
                {flagEmoji(code)}
            </span>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element -- external flag CDN, tiny images
        <img
            src={flagUrl}
            alt=""
            aria-hidden
            onError={() => setFailed(true)}
            className={`shrink-0 rounded-[2px] object-cover ${className}`}
        />
    );
}
