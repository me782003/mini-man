'use client';

import { Link } from '@/i18n/navigation';

type OrderStatus = 'Pending' | 'Shipped' | 'Delivered';

interface Order {
    id: string;
    status: OrderStatus;
    date: string;
    total: string;
}

const ORDERS: Order[] = [
    { id: '10212', status: 'Pending', date: 'August 22, 2025', total: '2,090 EGP' },
    { id: '10214', status: 'Shipped', date: 'August 22, 2025', total: '2,090 EGP' },
    { id: '10213', status: 'Delivered', date: 'August 22, 2025', total: '2,090 EGP' },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
    Pending: 'bg-orange-400 text-white',
    Shipped: 'bg-red-500 text-white',
    Delivered: 'bg-green-500 text-white',
};

export default function OrderHistoryClient() {
    return (
        <>
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">
                    Home
                </Link>
                <span>/</span>
                <Link href="/account" className="transition-colors hover:text-black">
                    Account
                </Link>
                <span>/</span>
                <span className="font-semibold text-black">Order History</span>
            </nav>

            <p className="font-beatrice text-[20px] font-bold uppercase text-black">
                Account
            </p>

            <h1 className="mt-8 font-beatrice text-[30px] font-bold leading-tight text-black sm:mt-10 sm:text-[42px]">
                Order History
            </h1>

            <p className="mt-2 mb-6 font-beatrice text-[13px] text-gray-500 sm:mb-7 sm:text-[14px]">
                Track, return, or repurchase your favorite skincare rituals.
            </p>

            <div className="space-y-4">
                {ORDERS.map(order => (
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
                                    className={`rounded-full px-3 py-1 font-beatrice text-[12px] font-medium ${STATUS_STYLES[order.status]}`}
                                >
                                    {order.status}
                                </span>
                            </div>

                            <p className="mt-1 font-beatrice text-[13px] leading-relaxed text-gray-500">
                                <span className="block sm:inline">
                                    Placed on: {order.date}
                                </span>
                                <span className="hidden sm:inline"> | </span>
                                <span className="block sm:inline">
                                    Total: {order.total}
                                </span>
                            </p>
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
        </>
    );
}