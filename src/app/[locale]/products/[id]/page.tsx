import type { Metadata } from 'next';
import ProductDetail from '@/components/Products/ProductDetail';
import { getProductForSeo } from '@/lib/api/product';
import { getSettings } from '@/lib/api/settings';
import { DEFAULT_SITE_NAME } from '@/lib/hooks/useSettings';
import { SITE_URL, localizedAlternates, toDescription } from '@/lib/seo';

type Params = Promise<{ id: string; locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { id, locale } = await params;
    const product = await getProductForSeo(locale, id);
    if (!product) return {};

    const description = toDescription(product.short_description) ?? toDescription(product.description);
    const images = [product.image_url, ...(product.images ?? []).map((i) => i.image_path)].filter((u): u is string => !!u).slice(0, 4);

    return {
        title: product.name,
        description,
        // Slug URL is canonical, even when the page was opened by numeric id.
        alternates: localizedAlternates(locale, `/products/${product.slug || product.id}`),
        openGraph: {
            title: product.name,
            description,
            url: `/${locale}/products/${product.slug || product.id}`,
            images: images.map((url) => ({ url, alt: product.name })),
        },
        twitter: { card: 'summary_large_image', title: product.name, description, images },
    };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
    const { id, locale } = await params;
    const [product, settings] = await Promise.all([getProductForSeo(locale, id), getSettings(locale)]);

    // Product + breadcrumb structured data (price, stock, photos) for rich search results.
    const jsonLd = product ? buildProductJsonLd(product, locale, settings?.site_info?.name || DEFAULT_SITE_NAME) : null;

    return (
        <main className="my-6">
            {jsonLd?.map((data, i) => (
                <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
            ))}
            <ProductDetail id={id} />
        </main>
    );
}

function buildProductJsonLd(product: NonNullable<Awaited<ReturnType<typeof getProductForSeo>>>, locale: string, brand: string) {
    const url = `${SITE_URL}/${locale}/products/${product.slug || product.id}`;
    const variants = (product.variants ?? []).flatMap((v) => v.colors ?? []);
    const inStock = product.is_available === 1 && (variants.length === 0 || variants.some((c) => (c.stock ?? 0) > 0 && c.is_available !== 0));
    const images = [product.image_url, ...(product.images ?? []).map((i) => i.image_path)].filter(Boolean);

    const productLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: toDescription(product.description, 500) ?? toDescription(product.short_description, 500),
        image: images,
        sku: variants.find((c) => c.sku)?.sku,
        brand: { '@type': 'Brand', name: brand },
        url,
        offers: {
            '@type': 'Offer',
            url,
            priceCurrency: 'EGP',
            price: Number(product.price).toFixed(2),
            availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
        },
    };

    const crumbs = product.breadcrumbs ?? [];
    const breadcrumbLd = crumbs.length > 0 && {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.label,
            item: c.url ? `${SITE_URL}/${locale}${c.url === '/' ? '' : c.url}` : url,
        })),
    };

    return [productLd, breadcrumbLd].filter(Boolean);
}
