'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { TrashIcon } from '../icons';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '@/lib/hooks/useCart';

function TagIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    );
}

export default function CartClient() {
    const { data: response, isLoading } = useCart();
    const removeItem = useRemoveCartItem();
    const updateItem = useUpdateCartItem();

    const [promoCode, setPromoCode] = useState('');
    const [agreed, setAgreed] = useState(false);

    const cartData = response?.data;
    const items = cartData?.items ?? [];
    const summary = cartData?.summary;

    if (isLoading) {
        return (
            <div className="container flex justify-center py-28">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
            </div>
        );
    }

    return (
        <div className="container">
            {/* Breadcrumb */}
            <nav className="mb-2 flex items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
            </nav>

            {/* Heading */}
            <h1 className="mb-6 font-beatrice text-[20px] font-bold uppercase text-black md:mb-8">
                Shopping Cart
            </h1>

            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
                {/* Cart items */}
                <div className="flex-1 border border-gray-200">
                    {items.length === 0 ? (
                        <p className="py-20 text-center font-beatrice text-[15px] text-gray-400">
                            Your cart is empty.
                        </p>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {items.map(item => (
                                <Link
                                    href={`/products/${item.product.id}`}
                                    key={item.cart_item_id}
                                    className="relative flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:gap-5 lg:p-6"
                                >
                                    <div className="flex gap-4 sm:gap-5 lg:contents">
                                        {/* Image */}
                                        <div className="flex h-[110px] w-[110px] shrink-0 items-center justify-center bg-[#e8e8e8] sm:h-[130px] sm:w-[130px]">
                                            <img
                                                src={item.product.image_url}
                                                alt={item.product.name}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="min-w-0 flex-1 lg:pr-8">
                                            <h3 className="mb-0.5 pr-8 font-beatrice text-[17px] font-medium text-black sm:text-[20px]">
                                                {item.product.name}
                                            </h3>
                                            <p className="mb-3 font-beatrice text-[18px] font-extrabold text-black sm:mb-4 sm:text-[20px]">
                                                {item.total_item_price.toLocaleString()} EGP
                                            </p>

                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-beatrice text-[12px] text-black sm:text-[13px]">
                                                <span className="flex items-center gap-1.5">
                                                    Color
                                                    <span
                                                        className="inline-block h-5 w-5 rounded-full border border-gray-200"
                                                        style={{ backgroundColor: item.variant.color_hexa }}
                                                    />
                                                </span>
                                                <span>
                                                    Size <span className="font-semibold">{item.variant.size}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={(e: React.MouseEvent) => {
                                            e.preventDefault();
                                            removeItem.mutate(item.cart_item_id);
                                        }}
                                        disabled={removeItem.isPending}
                                        className="absolute right-4 top-4 text-red-500 transition-colors hover:text-red-700 disabled:opacity-50 sm:right-5 sm:top-5"
                                        aria-label="Remove item"
                                    >
                                        <TrashIcon />
                                    </button>

                                    {/* Quantity */}
                                    <div onClick={(e: React.MouseEvent) => e.preventDefault()} className="mt-1 flex justify-end lg:absolute lg:bottom-5 lg:right-5 lg:mt-0">
                                        <div className="flex items-center border border-gray-300">
                                            <button
                                                onClick={() => updateItem.mutate({ itemId: item.cart_item_id, action: 'minus' })}
                                                disabled={item.quantity <= 1 || updateItem.isPending}
                                                className="flex h-8 w-8 items-center justify-center font-beatrice text-[18px] transition-colors hover:bg-gray-100 disabled:opacity-40"
                                            >
                                                −
                                            </button>
                                            <span className="flex h-8 w-8 items-center justify-center border-x border-gray-300 font-beatrice text-[14px] font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateItem.mutate({ itemId: item.cart_item_id, action: 'plus' })}
                                                disabled={updateItem.isPending}
                                                className="flex h-8 w-8 items-center justify-center font-beatrice text-[18px] transition-colors hover:bg-gray-100 disabled:opacity-40"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Order summary */}
                <div className="w-full shrink-0 border border-gray-200 p-5 sm:p-6 md:p-8 xl:w-[416px] xl:p-10">
                    <h2 className="mb-6 font-beatrice text-[20px] font-bold text-black">Order Summary</h2>

                    <div className="mb-4 space-y-[20px]">
                        <div className="flex justify-between gap-4 font-beatrice text-[15px] sm:text-[16px]">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-right font-bold text-black">
                                {summary ? parseFloat(summary.subtotal).toLocaleString() : '—'} EGP
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 font-beatrice text-[15px] sm:text-[16px]">
                            <span className="text-gray-500">Tax</span>
                            <span className="text-right font-bold text-black">
                                {summary ? parseFloat(summary.tax).toLocaleString() : '—'} EGP
                            </span>
                        </div>

                        <div className="flex justify-between gap-4 font-beatrice text-[15px] sm:text-[16px]">
                            <span className="text-gray-500">Shipping</span>
                            <span className="text-right font-bold text-black">??</span>
                        </div>
                    </div>

                    <div className="mb-8 border-t border-gray-200 pt-5 sm:mb-10">
                        <div className="flex items-baseline justify-between gap-4 font-beatrice">
                            <span className="text-[18px] font-bold text-black sm:text-[20px]">Total</span>
                            <span className="text-right text-[18px] font-extrabold text-black sm:text-[20px]">
                                {summary ? parseFloat(summary.total).toLocaleString() : '—'} EGP
                            </span>
                        </div>
                    </div>

                    {/* Promo code */}
                    <div className="mb-4 flex gap-2">
                        <div className="relative flex-1">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black">
                                <TagIcon className="h-5 w-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Add promo code"
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value)}
                                className="w-full border border-gray-300 py-3.5 pl-9 pr-2 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                            />
                        </div>
                        <button className="h-[52px] shrink-0 bg-black px-5 font-beatrice text-[14px] font-semibold tracking-wider text-white transition-colors hover:bg-neutral-800 sm:min-w-[110px]">
                            Apply
                        </button>
                    </div>

                    {/* Terms */}
                    <label className="mb-5 flex cursor-pointer items-start gap-2.5">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-black"
                        />
                        <span className="font-beatrice text-[13px] text-gray-600">
                            I agree to the <span className="font-bold text-black">Terms and Conditions</span>
                        </span>
                    </label>

                    {/* Checkout */}
                    <Link href="/shipping">
                        <button
                            disabled={!agreed || items.length === 0}
                            className="flex w-full items-center justify-between gap-4 bg-black px-4 py-3 font-beatrice text-[17px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-[20px]"
                        >
                            <span>Go to Checkout</span>
                            <svg width="30" height="12" viewBox="0 0 37 14" fill="none" className="shrink-0">
                                <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
