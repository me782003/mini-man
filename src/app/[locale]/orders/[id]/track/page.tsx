import OrderTrackingClient from '@/components/Account/OrderTrackingClient';

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
