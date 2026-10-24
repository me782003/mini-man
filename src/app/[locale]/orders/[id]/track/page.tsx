import OrderTrackingClient from '@/components/Account/OrderTrackingClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled with the order number, kept out of search results.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const [{ id }, t] = await Promise.all([params, getTranslations('Seo')]);
    return privatePage(t('trackOrder', { id }));
}

// Short link for "Track your order" emails / SMS. Login is enforced by the middleware.
export default async function TrackOrderPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return (
        <main className="container my-7 md:my-10">
            <OrderTrackingClient orderId={id} standalone />
        </main>
    );
}
