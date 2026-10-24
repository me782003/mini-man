'use client';

import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

const COLLAPSED_HEIGHT = 190; // ≈ 7 lines

type Parsed = { kind: 'features'; items: string[] } | { kind: 'html'; html: string };

/**
 * Descriptions are often one paragraph of short lines separated by <br> (or newlines) — really a
 * feature list. Show those as a checked list; anything else as sanitized rich text.
 */
function parseDescription(raw: string): Parsed {
    const clean = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
    const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, 'text/html');
    const root = doc.body.firstElementChild as HTMLElement;
    const blocks = Array.from(root.children);

    // Plain text with line breaks, or a single <p> holding only text and <br>s.
    const single = blocks.length === 0 ? root : blocks.length === 1 && blocks[0].tagName === 'P' ? (blocks[0] as HTMLElement) : null;
    if (single && Array.from(single.children).every(c => c.tagName === 'BR')) {
        const lines = single.innerHTML
            .split(/<br\s*\/?>|\n/i)
            .map(l => new DOMParser().parseFromString(l, 'text/html').body.textContent?.trim() ?? '')
            .filter(Boolean);
        if (lines.length >= 2 && lines.every(l => l.length <= 120)) return { kind: 'features', items: lines };
    }
    return { kind: 'html', html: clean };
}

export default function ProductDescription({ html }: { html: string | null | undefined }) {
    const t = useTranslations('Products');
    const [parsed, setParsed] = useState<Parsed | null>(null);
    const [expanded, setExpanded] = useState(false);
    // Full content height, so expanding animates to the real height instead of jumping.
    const [fullHeight, setFullHeight] = useState<number | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // DOMPurify needs the browser DOM, so the description is prepared after mount.
    useEffect(() => {
        const id = requestAnimationFrame(() => setParsed(html?.trim() ? parseDescription(html) : null));
        return () => cancelAnimationFrame(id);
    }, [html]);

    // Only offer "Show more" when the content is actually taller than the collapsed height.
    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setFullHeight(el.scrollHeight));
        ro.observe(el);
        return () => ro.disconnect();
    }, [parsed]);

    if (!html?.trim()) return null;

    if (!parsed) {
        return (
            <div className="max-w-[700px] space-y-2" aria-hidden>
                {[0, 1, 2].map(i => <div key={i} className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />)}
            </div>
        );
    }

    const overflows = fullHeight !== null && fullHeight > COLLAPSED_HEIGHT + 24;
    const collapsed = overflows && !expanded;
    const fade = 'linear-gradient(to bottom, #000 55%, transparent)';

    return (
        <div className="max-w-[700px]">
            <div
                id="product-description"
                ref={contentRef}
                className="overflow-hidden transition-[max-height] duration-300 ease-out"
                style={{
                    maxHeight: collapsed ? COLLAPSED_HEIGHT : fullHeight ?? 'none',
                    ...(collapsed ? { maskImage: fade, WebkitMaskImage: fade } : {}),
                }}
            >
                {parsed.kind === 'features' ? (
                    <ul className="space-y-2.5">
                        {parsed.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 font-beatrice text-[14px] leading-relaxed text-[#3f3f3f] md:text-[15px]">
                                <span aria-hidden className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-black text-white">
                                    <Check size={11} strokeWidth={3} />
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div
                        className="font-beatrice text-[14px] leading-relaxed text-[#5a5a5a] md:text-[15px] [&_a]:text-black [&_a]:underline [&_em]:italic [&_h1]:mb-2 [&_h1]:text-[20px] [&_h1]:font-bold [&_h1]:text-black [&_h2]:mb-2 [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:text-black [&_h3]:mb-1 [&_h3]:font-semibold [&_h3]:text-black [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:mb-3 [&_strong]:font-bold [&_strong]:text-black [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:ps-5"
                        dangerouslySetInnerHTML={{ __html: parsed.html }}
                    />
                )}
            </div>

            {overflows && (
                <button
                    type="button"
                    onClick={() => setExpanded(v => !v)}
                    aria-expanded={expanded}
                    aria-controls="product-description"
                    className="mt-3 inline-flex items-center gap-1.5 font-beatrice text-[14px] font-semibold text-black underline-offset-4 hover:underline"
                >
                    {expanded ? t('showLess') : t('showMore')}
                    <ChevronDown size={16} aria-hidden className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                </button>
            )}
        </div>
    );
}
