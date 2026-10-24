import type { MetadataRoute } from 'next';
import { API_BASE_URL } from '@/lib/fetcher';
import { getSettings } from '@/lib/api/settings';
import { SITE_URL } from '@/lib/seo';

// Rebuilt at most once a day.
export const revalidate = 86400;

const PAGE_SIZE = 200;
const MAX_PAGES = 50; // safety cap: 10,000 products

/** One entry per URL, with both language versions linked (hreflang). */
function entry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']): MetadataRoute.Sitemap[number] {
    return {
        url: `${SITE_URL}/en${path}`,
        changeFrequency,
        priority,
        alternates: { languages: { en: `${SITE_URL}/en${path}`, ar: `${SITE_URL}/ar${path}` } },
    };
}

async function productSlugs(): Promise<string[]> {
    const slugs: string[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
        try {
            const res = await fetch(`${API_BASE_URL}/user/catalog/products?page=${page}&limit=${PAGE_SIZE}`, {
                headers: { locale: 'en' },
                next: { revalidate },
            });
            if (!res.ok) break;
            const json = (await res.json()) as { data?: { id: number; slug?: string }[]; pagination?: { total_pages?: number } };
            for (const p of json.data ?? []) slugs.push(p.slug || String(p.id));
            if (page >= (json.pagination?.total_pages ?? 1)) break;
        } catch {
            break; // API down: publish the rest of the sitemap anyway
        }
    }
    return slugs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [settings, slugs] = await Promise.all([getSettings('en'), productSlugs()]);

    return [
        entry('', 1, 'daily'),
        entry('/products', 0.9, 'daily'),
        entry('/branches', 0.6, 'monthly'),
        entry('/contact', 0.5, 'yearly'),
        ...(settings?.static_pages ?? []).map((p) => entry(`/pages/${p.slug}`, 0.3, 'yearly')),
        ...(settings?.branches ?? []).map((b) => entry(`/branches/${b.id}`, 0.4, 'monthly')),
        ...slugs.map((slug) => entry(`/products/${slug}`, 0.8, 'weekly')),
    ];
}
