// Server-only SEO helpers (they read the cached store settings).
import type { Metadata } from 'next';
import { getSettings } from '@/lib/api/settings';

type OpenGraph = NonNullable<Metadata['openGraph']>;

/**
 * A page's `openGraph` replaces the layout's instead of merging with it, which drops the default
 * share image. Use this so every page keeps an image for link previews.
 */
export async function pageOpenGraph(locale: string, og: OpenGraph): Promise<OpenGraph> {
    if (og.images) return og;
    const settings = await getSettings(locale);
    const url = settings?.site_info?.header_logo || '/images/logo.png';
    return { ...og, images: [{ url, alt: settings?.site_info?.name ?? undefined }] };
}
