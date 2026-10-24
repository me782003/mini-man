import CartClient from '@/components/Cart/CartClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Seo');
    return privatePage(t('cart'));
}

export default function CartPage() {
    return (
        <main className=" my-[28px] md:my-10">
            <CartClient />
        </main>
    );
}
