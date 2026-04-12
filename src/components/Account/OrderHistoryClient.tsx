'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import AccountSidebar from '@/components/Account/AccountSidebar';


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
        <div className="container mx-auto py-8">
            <div className="flex gap-8">
                <AccountSidebar />

                <main className="min-w-0 flex-1">
                    {/* Breadcrumb */}
                    <nav className="mb-[10px] flex items-center gap-1 font-beatrice text-[12px] text-gray-500">
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

                    <p className="font-beatrice font-bold text-[20px] uppercase text-black">
                        Account
                    </p>

                    <h1 className="mt-10 font-beatrice text-[42px] font-bold leading-tight text-black">
                        Order History
                    </h1>
                    <p className="mt-2 mb-7 font-beatrice text-[14px] text-gray-500">
                        Track, return, or repurchase your favorite skincare rituals.
                    </p>

                    <div className="space-y-4">
                        {ORDERS.map(order => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between border border-gray-200 px-8 py-6"
                            >
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-beatrice text-[20px] font-semibold text-black">
                                            Order #{order.id}
                                        </span>
                                        <span
                                            className={`rounded-full px-3 py-1 font-beatrice text-[12px] font-medium ${STATUS_STYLES[order.status]}`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="mt-1 font-beatrice text-[13px] text-gray-500">
                                        Placed on: {order.date} | Total: {order.total}
                                    </p>
                                </div>
                                <Link
                                    href={`/account/orders/${order.id}`}
                                    className="border border-gray-300 px-6 py-3 font-beatrice text-[14px] font-medium text-black transition-colors hover:bg-gray-50"
                                >
                                    View Details
                                </Link>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
