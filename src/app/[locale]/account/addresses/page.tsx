import SavedAddressesClient from '@/components/Account/SavedAddressesClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Seo');
    return privatePage(t('addresses'));
}

export default function SavedAddressesPage() {
    return <SavedAddressesClient />;
}
