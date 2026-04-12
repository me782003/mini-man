'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import AccountSidebar from '@/components/Account/AccountSidebar';

type OrderStatus = 'Pending' | 'Shipped' | 'Delivered';

interface PointsEntry {
    id: string;
    orderId: string;
    status: OrderStatus;
    date: string;
    total: string;
    points: number;
}

const POINTS_HISTORY: PointsEntry[] = [
    { id: '1', orderId: '10214', status: 'Shipped', date: 'August 22, 2025', total: '2,090 EGP', points: 240 },
    { id: '2', orderId: '10214', status: 'Shipped', date: 'August 22, 2025', total: '2,090 EGP', points: 240 },
    { id: '3', orderId: '10214', status: 'Shipped', date: 'August 22, 2025', total: '2,090 EGP', points: 240 },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
    Pending: 'bg-orange-400 text-white',
    Shipped: 'bg-green-500 text-white',
    Delivered: 'bg-green-500 text-white',
};

const TOTAL_POINTS = 2450;

export default function RewardsClient() {
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
                        <span className="font-semibold text-black">Account</span>
                    </nav>

                    <p className="font-beatrice font-bold text-[20px] uppercase text-black">
                        Account
                    </p>

                    <h1 className="mt-10 font-beatrice text-[42px] font-bold leading-tight text-black">
                        Rewards points
                    </h1>
                    <p className="mt-2 mb-7 font-beatrice text-[14px] text-gray-500">
                        Shop more, earn more! Collect points on every purchase and turn them
                        into rewards you love.
                    </p>

                    {/* Balance */}
                    <div className="mb-6 text-center">
                        <p className="font-beatrice text-[56px] font-bold leading-none text-black">
                            {TOTAL_POINTS.toLocaleString()} Points
                        </p>
                        <p className="mt-2 font-beatrice text-[15px] text-gray-500">
                            Your Balance
                        </p>
                    </div>

                    {/* Points History card */}
                    <div className="border border-gray-200 p-8">
                        <h2 className="mb-5 font-beatrice text-[20px] font-semibold text-black">
                            Points History
                        </h2>

                        <div className="divide-y divide-gray-200">
                            {POINTS_HISTORY.map(entry => (
                                <div
                                    key={entry.id}
                                    className="flex items-center justify-between py-5"
                                >
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-beatrice text-[16px] font-semibold text-black">
                                                Order #{entry.orderId}
                                            </span>
                                            <span
                                                className={`rounded-full px-3 py-0.5 font-beatrice text-[12px] font-medium ${STATUS_STYLES[entry.status]}`}
                                            >
                                                {entry.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 font-beatrice text-[13px] text-gray-500">
                                            Placed on: {entry.date} | Total: {entry.total}
                                        </p>
                                    </div>
                                    <span className="font-beatrice text-[15px] font-semibold text-green-500">
                                        +{entry.points} pts
                                    </span>
                                </div>
                            ))}
                        </div>

                        <hr className="border-gray-200 mb-6 mt-2" />

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-8">
                            <p className="max-w-[400px] font-beatrice text-[13px] leading-relaxed text-gray-500">
                                By clicking &ldquo;Save Changes&rdquo;, you agree to our privacy
                                policy and updated terms of service regarding data editorial
                                practices.
                            </p>
                            <button className="flex shrink-0 items-center gap-6 bg-black px-7 py-3.5 font-beatrice text-[16px] font-semibold text-white transition-colors hover:bg-neutral-800">
                                <span>Save Changes</span>
                                <svg width="28" height="11" viewBox="0 0 37 14" fill="none">
                                    <path
                                        d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
