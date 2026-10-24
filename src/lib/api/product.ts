// Server-side product fetch for metadata + structured data. Cached by Next for 5 minutes.
import { API_BASE_URL } from '@/lib/fetcher';

export interface SeoProduct {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    short_description: string | null;
    price: string;
    is_available: number;
    image_url: string | null;
    images?: { image_path: string }[];
    variants?: { colors?: { sku?: string; stock?: number; is_available?: number }[] }[];
    breadcrumbs?: { label: string; url: string | null }[];
}

export async function getProductForSeo(locale: string, idOrSlug: string): Promise<SeoProduct | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/user/catalog/products/${encodeURIComponent(idOrSlug)}`, {
            headers: { locale },
            next: { revalidate: 300 },
        });
        if (!res.ok) return null; // 400/404 = not found
        const json = (await res.json()) as { data?: SeoProduct };
        return json.data ?? null;
    } catch {
        return null;
    }
}
