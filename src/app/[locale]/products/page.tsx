import ProductsClient from '@/components/Products/ProductsClient';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { localizedAlternates } from '@/lib/seo';
import { pageOpenGraph } from '@/lib/seo-server';

export async function generateMetadata(): Promise<Metadata> {
    const [t, locale] = await Promise.all([getTranslations('Seo'), getLocale()]);
    return {
        title: t('productsTitle'),
        description: t('productsDescription'),
        alternates: localizedAlternates(locale, '/products'),
        openGraph: await pageOpenGraph(locale, { title: t('productsTitle'), description: t('productsDescription'), url: `/${locale}/products` }),
    };
}

export default function ProductsPage() {
    return (
        <main className="container mt-6 mb-7 md:mt-10 md:mb-20">
            <ProductsClient />
        </main>
    );
}
