'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { TrashIcon } from '../icons';

interface CartItem {
    id: number;
    image: string;
    category: string;
    title: string;
    price: number;
    color: string;
    size: number;
    quantity: number;
}

const INITIAL_CART: CartItem[] = [
    {
        id: 1,
        image: '/images/image 9.png',
        category: "Men's Shoes",
        title: 'Nike Air Max Plus',
        price: 2590,
        color: '#9ea0a3',
        size: 41,
        quantity: 1,
    },
    {
        id: 2,
        image: '/images/image 10.png',
        category: "Men's Shoes",
        title: 'Nike Air Max Plus',
        price: 2000,
        color: '#c4a882',
        size: 44,
        quantity: 1,
    },
];

const FIXED_DISCOUNT = 500;



function TagIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    );
}

export default function CartClient() {
    const [items, setItems] = useState<CartItem[]>(INITIAL_CART);
    const [promoCode, setPromoCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(true);
    const [agreed, setAgreed] = useState(false);

    const updateQty = (id: number, delta: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
            )
        );
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = discountApplied ? FIXED_DISCOUNT : 0;
    const total = subtotal - discount;

    return (
        <div className="container mx-auto py-8">
            {/* Breadcrumb */}
            <nav className="mb-2 flex items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
            </nav>

            {/* Heading */}
            <h1 className="mb-8 font-beatrice text-[20px] font-bold uppercase  text-black">
                Shopping Cart
            </h1>

            <div className="flex gap-6 items-start">
                {/* Cart items */}
                <div className="flex-1 border border-gray-200">
                    {items.length === 0 ? (
                        <p className="py-20 text-center font-beatrice text-[15px] text-gray-400">
                            Your cart is empty.
                        </p>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {items.map(item => (
                                <div key={item.id} className="relative flex gap-5 p-6">
                                    {/* Image */}
                                    <div className="h-[130px] w-[130px] shrink-0 bg-[#e8e8e8] flex items-center justify-center">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 pr-8">
                                        <p className="font-beatrice text-[13px] text-gray-500 mb-0.5">
                                            {item.category}
                                        </p>
                                        <h3 className="font-beatrice font-medium text-[20px]  text-black mb-0.5">
                                            {item.title}
                                        </h3>
                                        <p className="font-beatrice text-[20px] font-extrabold text-black mb-4">
                                            {item.price.toLocaleString()} EGP
                                        </p>

                                        <div className="flex items-center gap-5 font-beatrice text-[13px] text-black">
                                            <span className="flex items-center gap-1.5">
                                                Color
                                                <span
                                                    className="inline-block h-5 w-5 rounded-full border border-gray-200"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                            </span>
                                            <span>
                                                Size{' '}
                                                <span className="font-semibold">{item.size}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute right-5 top-5 text-red-500 transition-colors hover:text-red-700"
                                        aria-label="Remove item"
                                    >
                                        <TrashIcon />
                                    </button>

                                    {/* Quantity */}
                                    <div className="absolute bottom-5 right-5 flex items-center border border-gray-300">
                                        <button
                                            onClick={() => updateQty(item.id, -1)}
                                            className="flex h-8 w-8 items-center justify-center font-beatrice text-[18px] transition-colors hover:bg-gray-100"
                                        >
                                            −
                                        </button>
                                        <span className="flex h-8 w-8 items-center justify-center border-x border-gray-300 font-beatrice text-[14px] font-medium">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQty(item.id, 1)}
                                            className="flex h-8 w-8 items-center justify-center font-beatrice text-[18px] transition-colors hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Order summary */}
                <div className="w-[416px] shrink-0 border border-gray-200 p-10">
                    <h2 className="mb-6 font-beatrice text-[20px] font-bold text-black">
                        Order Summary
                    </h2>

                    <div className="mb-4 space-y-[20px]">
                        <div className="flex justify-between font-beatrice text-[16px]">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-bold text-black">
                                {subtotal.toLocaleString()} EGP
                            </span>
                        </div>
                        <div className="flex justify-between font-beatrice text-[16px]">
                            <span className="text-gray-500">Shipping</span>
                            <span className="font-bold text-black">??</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between font-beatrice text-[16px]">
                                <span className="text-gray-500">Discount</span>
                                <span className="font-bold text-red-500">
                                    -{discount.toLocaleString()} EGP
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mb-10 border-t border-gray-200 pt-5">
                        <div className="flex items-baseline justify-between font-beatrice">
                            <span className="text-[20px] font-bold text-black">Total</span>
                            <span className="text-[20px] font-extrabold text-black">
                                {total.toLocaleString()} EGP
                            </span>
                        </div>
                    </div>

                    {/* Promo code */}
                    <div className="mb-4 flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black pointer-events-none">
                                <TagIcon className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Add promo code"
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value)}
                                className="w-full border border-gray-300 py-3.5 pl-9 pr-2 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={() => setDiscountApplied(true)}
                            className="bg-black px-5 font-beatrice text-[14px] font-semibold  tracking-wider text-white transition-colors hover:bg-neutral-800"
                        >
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
                            I agree to the{' '}
                            <span className="font-bold text-black">Terms and Conditions</span>
                        </span>
                    </label>

                    {/* Checkout */}
                    <button
                        disabled={!agreed || items.length === 0}
                        className="flex w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[20px] font-semibold  text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span>Go to Checkout</span>
                        <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
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
        </div>
    );
}
