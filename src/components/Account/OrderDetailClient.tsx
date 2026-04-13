'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

interface OrderItem {
    id: string;
    category: string;
    name: string;
    price: string;
    color: string;
    size: number;
    image: string;
}

interface OrderData {
    id: string;
    shipping: {
        name: string;
        phone: string;
        address: string;
        country: string;
    };
    payment: string;
    items: OrderItem[];
    subtotal: string;
    shipping_cost: string;
    discount: string;
    total: string;
}

const MOCK_ORDER: OrderData = {
    id: '10211',
    shipping: {
        name: 'Ahmed Al Saud',
        phone: '+20 15578 15 853',
        address: 'Cairo, Building 123',
        country: 'Egypt, 12345',
    },
    payment: 'Credit/Debit Card',
    items: [
        {
            id: '1',
            category: "Men's Shoes",
            name: 'Nike Air Max Plus',
            price: '2,590 EGP',
            color: '#9CA3AF',
            size: 41,
            image: '/images/sh-1.png',
        },
        {
            id: '2',
            category: "Men's Shoes",
            name: 'Nike Air Max Plus',
            price: '2,000 EGP',
            color: '#C49A6C',
            size: 44,
            image: '/images/sh-2.png',
        },
    ],
    subtotal: '2,590 EGP',
    shipping_cost: '??',
    discount: '-500 EGP',
    total: '2,090 EGP',
};

interface OrderDetailClientProps {
    orderId: string;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
    const order = { ...MOCK_ORDER, id: orderId };

    return (
        <>
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">
                    Home
                </Link>
                <span>/</span>
                <span className="font-semibold text-black">Account</span>
            </nav>

            <p className="font-beatrice text-[20px] font-bold uppercase text-black">
                Account
            </p>

            <h1 className="mt-8 font-beatrice text-[30px] font-bold leading-tight text-black sm:mt-10 sm:text-[42px]">
                Order #{order.id}
            </h1>

            <p className="mt-2 mb-6 font-beatrice text-[13px] text-gray-500 sm:mb-7 sm:text-[14px]">
                Track, return, or repurchase your favorite skincare rituals.
            </p>

            {/* Two-column layout */}
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
                {/* Left column */}
                <div className="min-w-0 flex-1 space-y-3">
                    {/* Shipping */}
                    <div className="bg-gray-100 p-5 sm:p-6">
                        <p className="mb-3 font-beatrice text-[16px] font-semibold text-black">
                            Shipping
                        </p>
                        <p className="font-beatrice text-[14px] text-gray-700">
                            {order.shipping.name}
                        </p>
                        <p className="font-beatrice text-[14px] text-gray-700">
                            {order.shipping.phone}
                        </p>
                        <p className="font-beatrice text-[14px] text-gray-700">
                            {order.shipping.address}
                        </p>
                        <p className="font-beatrice text-[14px] text-gray-700">
                            {order.shipping.country}
                        </p>
                    </div>

                    {/* Payment */}
                    <div className="bg-gray-100 p-5 sm:p-6">
                        <p className="mb-2 font-beatrice text-[16px] font-semibold text-black">
                            Payment
                        </p>
                        <p className="font-beatrice text-[14px] text-gray-700">
                            {order.payment}
                        </p>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-gray-200 border border-gray-200">
                        {order.items.map(item => (
                            <div
                                key={item.id}
                                className="flex  gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5"
                            >
                                <div className="relative h-[100px] w-[100px] shrink-0 bg-gray-100 sm:h-[120px] sm:w-[120px]">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-contain p-2"
                                    />
                                </div>

                                <div className="pt-0 sm:pt-1">
                                    <p className="font-beatrice text-[12px] text-gray-500">
                                        {item.category}
                                    </p>
                                    <p className="mt-1 font-beatrice text-[15px] font-semibold text-black sm:text-[16px]">
                                        {item.name}
                                    </p>
                                    <p className="mt-1 font-beatrice text-[15px] font-bold text-black">
                                        {item.price}
                                    </p>

                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="font-beatrice text-[13px] text-gray-500">
                                            Color
                                        </span>
                                        <span
                                            className="inline-block h-4 w-4 rounded-full border border-gray-200"
                                            style={{ backgroundColor: item.color }}
                                        />
                                    </div>

                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="font-beatrice text-[13px] text-gray-500">
                                            Size
                                        </span>
                                        <span className="font-beatrice text-[13px] text-black">
                                            {item.size}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column — Order Summary */}
                <div className="w-full shrink-0 border border-gray-200 p-5 sm:p-6 xl:w-[280px]">
                    <p className="mb-5 font-beatrice text-[18px] font-bold text-black">
                        Order Summary
                    </p>

                    <div className="space-y-3">
                        <div className="flex justify-between gap-4 font-beatrice text-[14px] text-gray-600">
                            <span>Subtotal</span>
                            <span className="text-right font-medium text-black">
                                {order.subtotal}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4 font-beatrice text-[14px] text-gray-600">
                            <span>Shipping</span>
                            <span className="text-right font-medium text-black">
                                {order.shipping_cost}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4 font-beatrice text-[14px] text-gray-600">
                            <span>Discount</span>
                            <span className="text-right font-medium text-red-500">
                                {order.discount}
                            </span>
                        </div>
                    </div>

                    <hr className="my-4 border-gray-200" />

                    <div className="flex justify-between gap-4 font-beatrice text-[16px] font-bold text-black">
                        <span>Total</span>
                        <span className="text-right">{order.total}</span>
                    </div>

                    <button className="mt-6 flex w-full items-center justify-between bg-black px-5 py-3.5 font-beatrice text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800">
                        <span>Reorder</span>
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
        </>
    );
}