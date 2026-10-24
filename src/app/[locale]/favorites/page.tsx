import FavoritesClient from '@/components/Favorites/FavoritesClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Seo');
    return privatePage(t('favorites'));
}

export default function FavoritesPage() {
    return (
        <main className="container  my-7 md:my-10">
            <FavoritesClient />
        </main>
    );
}
