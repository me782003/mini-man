import type { Metadata } from 'next';

/** Public site origin, used for absolute URLs (canonical, Open Graph, sitemap). Set it in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const LOCALES = ['en', 'ar'] as const;
export const OG_LOCALE: Record<string, string> = { en: 'en_US', ar: 'ar_EG' };

/**
 * Canonical URL for this language + links to the other language versions (hreflang).
 * `path` is locale-less: '' for home, '/products', '/products/some-slug'…
 */
export function localizedAlternates(locale: string, path = ''): Metadata['alternates'] {
    return {
        canonical: `/${locale}${path}`,
        languages: {
            en: `/en${path}`,
            ar: `/ar${path}`,
            'x-default': `/en${path}`,
        },
    };
}

/** Account, cart, checkout and auth pages: keep them out of search results. */
export const PRIVATE_ROBOTS: Metadata['robots'] = { index: false, follow: false };

export function privatePage(title: string): Metadata {
    return { title, robots: PRIVATE_ROBOTS };
}

/** Plain-text summary of HTML for meta descriptions (~160 chars, cut on a word). */
export function toDescription(html: string | null | undefined, max = 160): string | undefined {
    if (!html) return undefined;
    const text = html
        .replace(/<(script|style|title|head)[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
    if (!text) return undefined;
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : max).trim()}…`;
}

/** Paths that must not be crawled (same for both languages). */
export const PRIVATE_PATHS = [
    '/cart', '/checkout', '/shipping', '/payment', '/order-success', '/orders',
    '/account', '/favorites', '/login', '/register', '/forgot-password', '/reset-password', '/verify-otp',
];
