import { Suspense } from 'react';
import OrderSuccessClient from '@/components/Checkout/OrderSuccessClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Seo');
    return privatePage(t('orderSuccess'));
}

export default function OrderSuccessPage() {
    return (
        <main className="my-7 md:my-10">
            <Suspense fallback={null}>
                <OrderSuccessClient />
            </Suspense>
        </main>
    );
}
