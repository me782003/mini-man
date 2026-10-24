'use client';

import React from 'react';
import { Check } from 'lucide-react';

/** True for light colours (white, cream, yellow…) — they need dark marks on top. */
export function isLightColor(hex: string | null | undefined): boolean {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex ?? '').trim());
    if (!m) return false;
    const h = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1];
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    // Relative luminance (sRGB approximation).
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.7;
}

const SIZES = {
    sm: { box: 'h-4 w-4 sm:h-5 sm:w-5', ring: 'ring-offset-1', check: 10 },
    lg: { box: 'h-9 w-9 md:h-11 md:w-11', ring: 'ring-offset-2', check: 18 },
} as const;

interface ColorSwatchProps {
    color: string;
    selected?: boolean;
    disabled?: boolean;
    size?: keyof typeof SIZES;
    /** Shows a check mark on the selected swatch (large swatches). */
    showCheck?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    label: string;
    title?: string;
}

/**
 * A round colour swatch. Every swatch has a faint inner outline so white and pale colours stay
 * visible on a white page; the selected one gets a ring with a gap; sold-out ones are crossed out.
 */
export default function ColorSwatch({ color, selected = false, disabled = false, size = 'lg', showCheck = false, onClick, label, title }: ColorSwatchProps) {
    const s = SIZES[size];
    const light = isLightColor(color);

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={selected}
            title={title}
            className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full transition-all duration-150 ${s.box} ${s.ring} ring-offset-white
                ${selected ? 'ring-2 ring-black' : 'ring-0 hover:ring-2 hover:ring-gray-300'}
                disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:ring-0
                outline-none focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-black`}
            style={{ backgroundColor: color }}
        >
            {/* Edge that keeps white / light swatches visible. */}
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]" />
            {selected && showCheck && (
                <Check aria-hidden size={s.check} strokeWidth={3} className={`relative ${light ? 'text-black' : 'text-white'}`} />
            )}
            {disabled && (
                <span
                    aria-hidden
                    className={`pointer-events-none absolute h-[1.5px] w-[140%] rotate-45 ${light ? 'bg-gray-500' : 'bg-white/80'}`}
                />
            )}
        </button>
    );
}
