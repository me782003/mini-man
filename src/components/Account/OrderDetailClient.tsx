'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useOrderDetail } from '@/lib/hooks/useOrders';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-orange-400 text-white',
    processing: 'bg-blue-500 text-white',
    shipped: 'bg-red-500 text-white',
    delivered: 'bg-green-500 text-white',
    cancelled: 'bg-gray-400 text-white',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash_on_delivery: 'Cash on Delivery',
    card: 'Credit / Debit Card',
    apple_pay: 'Apple Pay',
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function fmt(val: string) {
    return parseFloat(val).toLocaleString() + ' EGP';
}

interface Props { orderId: string; }

export default function OrderDetailClient({ orderId }: Props) {
    const { data, isLoading } = useOrderDetail(orderId);
    const order = data?.data;

    if (isLoading) {
        return (
            <div className="flex justify-center py-28">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
            </div>
        );
    }

    if (!order) {
        return (
            <p className="py-20 text-center font-beatrice text-[15px] text-gray-400">Order not found.</p>
        );
    }

    const addr = order.shipping_address;

    return (
        <>
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
                <Link href="/account" className="transition-colors hover:text-black">Account</Link>
                <span>/</span>
                <Link href="/account/orders" className="transition-colors hover:text-black">Orders</Link>
                <span>/</span>
                <span className="font-semibold text-black">#{order.id}</span>
            </nav>

            <p className="font-beatrice text-[20px] font-bold uppercase text-black">Account</p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
                <h1 className="font-beatrice text-[30px] font-bold leading-tight text-black sm:text-[42px]">
                    Order #{order.id}
                </h1>
                <span className={`rounded-full px-3 py-1 font-beatrice text-[13px] font-medium capitalize ${STATUS_STYLES[order.current_status] ?? 'bg-gray-200 text-black'}`}>
                    {order.current_status}
                </span>
            </div>

            <p className="mt-2 mb-6 font-beatrice text-[13px] text-gray-500 sm:mb-7 sm:text-[14px]">
                Placed on {formatDate(order.created_at)}
            </p>

            <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
                {/* Left column */}
                <div className="min-w-0 flex-1 space-y-3">
                    {/* Shipping */}
                    <div className="bg-gray-100 p-5 sm:p-6">
                        <p className="mb-3 font-beatrice text-[16px] font-semibold text-black">Shipping</p>
                        <p className="font-beatrice text-[14px] text-gray-700">{addr.first_name} {addr.last_name}</p>
                        <p className="font-beatrice text-[14px] text-gray-700">{addr.phone}</p>
                        <p className="font-beatrice text-[14px] text-gray-700">
                            {addr.street_address}{addr.apartment ? `, ${addr.apartment}` : ''}, {addr.city}
                        </p>
                    </div>

                    {/* Payment */}
                    <div className="bg-gray-100 p-5 sm:p-6">
                        <p className="mb-2 font-beatrice text-[16px] font-semibold text-black">Payment</p>
                        <p className="font-beatrice text-[14px] text-gray-700">
                            {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}
                        </p>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-gray-200 border border-gray-200">
                        {order.items.map(item => {
                            const snap = item.product_snapshot;
                            const variant = snap.variant_details;
                            const lineTotal = parseFloat(item.price_at_purchase) * item.quantity;
                            return (
                                <div key={item.id} className="flex gap-4 p-4 sm:gap-5 sm:p-5">
                                    <div className="h-[100px] w-[100px] shrink-0 bg-gray-100 sm:h-[120px] sm:w-[120px]">
                                        <img
                                            src={snap.image_url}
                                            alt={snap.name}
                                            className="h-full w-full object-contain p-2"
                                            onError={e => { const img = e.currentTarget as HTMLImageElement; img.src = '/images/logo.png'; img.classList.add('opacity-20'); }}
                                        />
                                    </div>
                                    <div className="pt-1">
                                        <p className="font-beatrice text-[15px] font-semibold text-black sm:text-[16px]">
                                            {snap.name}
                                        </p>
                                        <p className="mt-1 font-beatrice text-[15px] font-bold text-black">
                                            {lineTotal.toLocaleString()} EGP
                                        </p>
                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                                            <span className="flex items-center gap-1.5 font-beatrice text-[13px] text-gray-500">
                                                Color
                                                <span
                                                    className="inline-block h-4 w-4 rounded-full border border-gray-200"
                                                    style={{ backgroundColor: variant.color_hexa }}
                                                />
                                            </span>
                                            <span className="font-beatrice text-[13px] text-gray-500">
                                                Size <span className="font-semibold text-black">{variant.size}</span>
                                            </span>
                                            <span className="font-beatrice text-[13px] text-gray-500">
                                                Qty <span className="font-semibold text-black">{item.quantity}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tracking history */}
                    {order.tracking_history.length > 0 && (
                        <div className="bg-gray-100 p-5 sm:p-6">
                            <p className="mb-4 font-beatrice text-[16px] font-semibold text-black">Tracking</p>
                            <div className="space-y-3">
                                {order.tracking_history.map(entry => (
                                    <div key={entry.id} className="flex gap-3">
                                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-black" />
                                        <div>
                                            <p className="font-beatrice text-[13px] font-semibold capitalize text-black">{entry.status}</p>
                                            <p className="font-beatrice text-[12px] text-gray-500">{entry.notes}</p>
                                            <p className="font-beatrice text-[11px] text-gray-400">{formatDate(entry.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right column — Order Summary */}
                <div className="w-full shrink-0 border border-gray-200 p-5 sm:p-6 xl:w-[280px]">
                    <p className="mb-5 font-beatrice text-[18px] font-bold text-black">Order Summary</p>

                    <div className="space-y-3">
                        <div className="flex justify-between gap-4 font-beatrice text-[14px] text-gray-600">
                            <span>Subtotal</span>
                            <span className="text-right font-medium text-black">{fmt(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between gap-4 font-beatrice text-[14px] text-gray-600">
                            <span>Shipping</span>
                            <span className="text-right font-medium text-black">{fmt(order.shipping_amount)}</span>
                        </div>
                        {/* <div className="flex justify-between gap-4 font-beatrice text-[14px] text-gray-600">
                            <span>Tax</span>
                            <span className="text-right font-medium text-black">{fmt(order.tax_amount)}</span>
                        </div> */}
                        {parseFloat(order.coupon_discount) > 0 && (
                            <div className="flex justify-between gap-4 font-beatrice text-[14px] text-gray-600">
                                <span>Discount</span>
                                <span className="text-right font-medium text-red-500">-{fmt(order.coupon_discount)}</span>
                            </div>
                        )}
                    </div>

                    <hr className="my-4 border-gray-200" />

                    <div className="flex justify-between gap-4 font-beatrice text-[16px] font-bold text-black">
                        <span>Total</span>
                        <span className="text-right">{fmt(order.total_amount)}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
