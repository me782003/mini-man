import CheckoutClient from '@/components/Checkout/CheckoutClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Seo');
    return privatePage(t('checkout'));
}

export default function CheckoutPage() {
    return (
        <main className=" my-7 md:my-10">
            <CheckoutClient />
        </main>
    );
}
