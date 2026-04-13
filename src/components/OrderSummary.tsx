'use client';

import React from 'react';

function LockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
    );
}

export function SecurePaymentBadge() {
    return (
        <div className="flex items-start gap-3 border border-[#388E3C] bg-[#E8F5E9] p-5">
            <span className="mt-0.5 shrink-0 text-[#4caf7d]">
                <LockIcon />
            </span>
            <div>
                <p className="font-beatrice text-[13px] font-bold text-[#388E3C]">
                    Secure Payment
                </p>
                <p className="font-beatrice text-[14px] text-[#388E3C]">
                    Your payment information is encrypted and secure.
                </p>
            </div>
        </div>
    );
}

interface OrderSummaryProps {
    subtotal: number;
    discount: number;
    className?: string;
    children?: React.ReactNode;
}

export default function OrderSummary({ subtotal, discount, className, children }: OrderSummaryProps) {
    const total = subtotal - discount;

    return (
        <div className={className ?? ' w-full md:w-[507px] shrink-0 border border-gray-200 p-5 md:p-10'}>
            <h2 className="mb-5 md:mb-10 font-beatrice text-[20px] font-bold text-black">
                Order Summary
            </h2>

            <div className="mb-4 space-y-[20px]">
                <div className="flex justify-between font-beatrice text-[14px] md:text-[16px]">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-black">{subtotal.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between font-beatrice text-[14px] md:text-[16px]">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-bold text-black">??</span>
                </div>
                <div className="flex justify-between font-beatrice text-[14px] md:text-[16px]">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-bold text-[#FF383C]">-{discount.toLocaleString()} EGP</span>
                </div>
            </div>

            <div className={` mb-0 md:mb-6    border-t border-gray-200 pt-4`}>
                <div className="flex items-baseline justify-between font-beatrice">
                    <span className="text-[20px] font-bold text-black">Total</span>
                    <span className="text-[20px] font-extrabold text-black">{total.toLocaleString()} EGP</span>
                </div>
            </div>

            {children}
        </div >
    );
}
