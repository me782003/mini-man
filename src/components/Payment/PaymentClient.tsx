'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { CircleCheckBig, CreditCard, MapPin } from 'lucide-react';

function LockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
    );
}

function AppleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
    );
}

const STEPS = [
    { label: 'Shipping', icon: <MapPin /> },
    { label: 'Payment', icon: <CreditCard /> },
    { label: 'Checkout', icon: <CircleCheckBig /> },
];

const FIXED_DISCOUNT = 500;
const SUBTOTAL = 2590;

type PaymentMethod = 'card' | 'apple';

export default function PaymentClient() {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [form, setForm] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });

    const currentStep = 1;
    const total = SUBTOTAL - FIXED_DISCOUNT;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="container mx-auto py-8">
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex items-center gap-1 font-beatrice text-[14px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
                <Link href="/cart" className="transition-colors hover:text-black">Shopping Cart</Link>
                <span>/</span>
                <span className="font-semibold text-black">Payment</span>
            </nav>

            {/* Heading */}
            <h1 className="mb-10 font-beatrice text-[20px] font-bold uppercase text-black">
                Payment
            </h1>

            {/* Progress stepper */}
            <div className="mb-8 flex items-center bg-[#7575751A] border border-[#D7D7D7] px-10 py-5">
                {STEPS.map((step, index) => (
                    <React.Fragment key={step.label}>
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${index === currentStep
                                    ? 'border-[#6aaa84] bg-[#6aaa84] text-white'
                                    : index < currentStep
                                        ? 'border-[#6aaa84] bg-[#6aaa84] text-white'
                                        : 'border-gray-300 bg-white text-gray-400'
                                    }`}
                            >
                                {step.icon}
                            </div>
                            <span
                                className={`font-beatrice text-[14px] font-medium ${index === currentStep ? 'font-bold text-black' : index < currentStep ? 'text-black' : 'text-gray-400'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div className={`mx-4 mb-6 h-[2px] rounded-full flex-1 ${index < currentStep ? 'bg-[#6aaa84]' : 'bg-[#D7D7D7]'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="flex gap-10 items-start">
                {/* Billing Information */}
                <div className="flex-1 border border-gray-200 p-10">
                    <h2 className="mb-6 font-beatrice text-[20px] font-bold text-black">
                        Billing Information
                    </h2>

                    {/* Payment method selection */}
                    <div className="mb-8 space-y-3">
                        {/* Credit/Debit Card option */}
                        <label
                            className={`flex cursor-pointer items-center gap-4 border px-5 py-4 transition-colors ${paymentMethod === 'card'
                                ? 'border-[#6aaa84] bg-[#f0f9f4]'
                                : 'border-[#E0E0E0] bg-white'
                                }`}
                        >
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${paymentMethod === 'card' ? 'border-[#6aaa84]' : 'border-gray-300'}`}>
                                {paymentMethod === 'card' && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#6aaa84]" />
                                )}
                            </div>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="card"
                                checked={paymentMethod === 'card'}
                                onChange={() => setPaymentMethod('card')}
                                className="sr-only"
                            />
                            <span className="flex items-center gap-3">
                                <svg width="22" height="16" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="1" width="22" height="16" rx="2" ry="2" />
                                    <line x1="1" y1="7" x2="23" y2="7" />
                                </svg>
                                <span>
                                    <span className="block font-beatrice text-[14px] font-bold text-black">Credit/Debit Card</span>
                                    <span className="block font-beatrice text-[13px] text-gray-500">Pay securely with your card</span>
                                </span>
                            </span>
                        </label>

                        {/* Apple Pay option */}
                        <label
                            className={`flex cursor-pointer items-center gap-4 border px-5 py-4 transition-colors ${paymentMethod === 'apple'
                                ? 'border-[#6aaa84] bg-[#f0f9f4]'
                                : 'border-[#E0E0E0] bg-white'
                                }`}
                        >
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${paymentMethod === 'apple' ? 'border-[#6aaa84]' : 'border-gray-300'}`}>
                                {paymentMethod === 'apple' && (
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#6aaa84]" />
                                )}
                            </div>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="apple"
                                checked={paymentMethod === 'apple'}
                                onChange={() => setPaymentMethod('apple')}
                                className="sr-only"
                            />
                            <span className="flex items-center gap-3">
                                <AppleIcon />
                                <span>
                                    <span className="block font-beatrice text-[14px] font-bold text-black">Apple Pay</span>
                                    <span className="block font-beatrice text-[13px] text-gray-500">One-click payment</span>
                                </span>
                            </span>
                        </label>
                    </div>

                    {/* Card details (shown only when card is selected) */}
                    {paymentMethod === 'card' && (
                        <>
                            <h3 className="mb-4 font-beatrice text-[16px] font-bold text-black">
                                Credit/Debit Card Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="expiryDate"
                                    placeholder="Expiration Date"
                                    value={form.expiryDate}
                                    onChange={handleChange}
                                    className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                                />
                                <input
                                    type="text"
                                    name="cvv"
                                    placeholder="CVV"
                                    value={form.cvv}
                                    onChange={handleChange}
                                    className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                                />
                                <input
                                    type="text"
                                    name="cardNumber"
                                    placeholder="Card Number *"
                                    value={form.cardNumber}
                                    onChange={handleChange}
                                    className="col-span-2 border border-[#E0E0E0] px-4 py-3 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                                />
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex gap-4">
                        <button className="flex flex-1 items-center justify-between bg-black px-5 py-3 font-beatrice text-[20px] font-semibold text-white transition-colors hover:bg-neutral-800">
                            <span>Continue to delivery</span>
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
                        <Link
                            href="/shipping"
                            className="flex items-center justify-center border border-black px-8 py-3 font-beatrice text-[16px] font-semibold text-black transition-colors hover:bg-gray-100"
                        >
                            Back
                        </Link>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="w-[507px] shrink-0 border border-gray-200 p-10">
                    <h2 className="mb-10 font-beatrice text-[20px] font-bold text-black">
                        Order Summary
                    </h2>

                    <div className="mb-4 space-y-[20px]">
                        <div className="flex justify-between font-beatrice text-[16px]">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-bold text-black">
                                {SUBTOTAL.toLocaleString()} EGP
                            </span>
                        </div>
                        <div className="flex justify-between font-beatrice text-[16px]">
                            <span className="text-gray-500">Shipping</span>
                            <span className="font-bold text-black">??</span>
                        </div>
                        <div className="flex justify-between font-beatrice text-[16px]">
                            <span className="text-gray-500">Discount</span>
                            <span className="font-bold text-[#FF383C]">
                                -{FIXED_DISCOUNT.toLocaleString()} EGP
                            </span>
                        </div>
                    </div>

                    <div className="mb-6 border-t border-gray-200 pt-4">
                        <div className="flex items-baseline justify-between font-beatrice">
                            <span className="text-[20px] font-bold text-black">Total</span>
                            <span className="text-[20px] font-extrabold text-black">
                                {total.toLocaleString()} EGP
                            </span>
                        </div>
                    </div>

                    {/* Secure payment badge */}
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
                </div>
            </div>
        </div>
    );
}
