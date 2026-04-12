import OrderDetailClient from '@/components/Account/OrderDetailClient';

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return (
        <main className="my-28">
            <OrderDetailClient orderId={id} />
        </main>
    );
}
