import OrderHistoryClient from '@/components/Account/OrderHistoryClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Seo');
    return privatePage(t('orders'));
}

export default function OrderHistoryPage() {
    return <OrderHistoryClient />;
}
