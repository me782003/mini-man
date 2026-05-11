'use client';

import { Link } from '@/i18n/navigation';
import { useOrders } from '@/lib/hooks/useOrders';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-orange-400 text-white',
    processing: 'bg-blue-500 text-white',
    shipped: 'bg-red-500 text-white',
    delivered: 'bg-green-500 text-white',
    cancelled: 'bg-gray-400 text-white',
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function OrderHistoryClient() {
    const { data, isLoading } = useOrders();
    const orders = data?.data ?? [];

    return (
        <>
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
                <Link href="/account" className="transition-colors hover:text-black">Account</Link>
                <span>/</span>
                <span className="font-semibold text-black">Order History</span>
            </nav>

            <p className="font-beatrice text-[20px] font-bold uppercase text-black">Account</p>

            <h1 className="mt-8 font-beatrice text-[30px] font-bold leading-tight text-black sm:mt-10 sm:text-[42px]">
                Order History
            </h1>

            <p className="mt-2 mb-6 font-beatrice text-[13px] text-gray-500 sm:mb-7 sm:text-[14px]">
                Track, return, or repurchase your favorite skincare rituals.
            </p>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                </div>
            ) : orders.length === 0 ? (
                <p className="py-16 text-center font-beatrice text-[15px] text-gray-400">No orders found.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div
                            key={order.id}
                            className="flex flex-col gap-4 border border-gray-200 px-4 py-5 sm:px-6 md:px-8 md:py-6 lg:flex-row lg:items-center lg:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <span className="font-beatrice text-[18px] font-semibold text-black sm:text-[20px]">
                                        Order #{order.id}
                                    </span>
                                    <span
                                        className={`rounded-full px-3 py-1 font-beatrice text-[12px] font-medium capitalize ${STATUS_STYLES[order.current_status] ?? 'bg-gray-200 text-black'}`}
                                    >
                                        {order.current_status}
                                    </span>
                                </div>

                                <p className="mt-1 font-beatrice text-[13px] leading-relaxed text-gray-500">
                                    <span className="block sm:inline">Placed on: {formatDate(order.created_at)}</span>
                                    <span className="hidden sm:inline"> | </span>
                                    <span className="block sm:inline">Total: {parseFloat(order.total_amount).toLocaleString()} EGP</span>
                                </p>

                                {order.shipping_address && (
                                    <p className="mt-0.5 font-beatrice text-[12px] text-gray-400">
                                        {order.shipping_address.street_address}, {order.shipping_address.city}
                                    </p>
                                )}
                            </div>

                            <Link
                                href={`/account/orders/${order.id}`}
                                className="inline-flex w-full items-center justify-center border border-gray-300 px-5 py-3 font-beatrice text-[14px] font-medium text-black transition-colors hover:bg-gray-50 sm:w-auto sm:px-6"
                            >
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
