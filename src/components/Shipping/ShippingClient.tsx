'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { CircleCheckBig, CreditCard, MapPin } from 'lucide-react';

function LocationPinIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
        </svg>
    );
}

function CreditCardIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
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

export default function ShippingClient() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        address: '',
    });

    const currentStep = 0;
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
                <span className="font-semibold text-black">Shipping</span>
            </nav>

            {/* Heading */}
            <h1 className="mb-10 font-beatrice text-[20px] font-bold uppercase  text-black">
                Shipping
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
                                className={`font-beatrice text-[14px] font-medium ${index === currentStep ? 'font-bold text-black' : 'text-gray-400'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div className="mx-4 mb-6 h-[2px] rounded-full flex-1 bg-[#D7D7D7]" />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="flex gap-10 items-start">
                {/* Delivery Information form */}
                <div className="flex-1 border border-gray-200 p-10">
                    <h2 className="mb-10 font-beatrice text-[20px] font-bold text-black">
                        Delivery Information
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={form.firstName}
                            onChange={handleChange}
                            className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={form.lastName}
                            onChange={handleChange}
                            className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={form.country}
                            onChange={handleChange}
                            className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={form.city}
                            onChange={handleChange}
                            className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Address in Details"
                            value={form.address}
                            onChange={handleChange}
                            className="col-span-2 border border-[#E0E0E0] px-4 py-3 font-beatrice text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                    </div>

                    <button className="mt-6 flex w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[20px] font-semibold  text-white transition-colors hover:bg-neutral-800">
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
                </div>

                {/* Order Summary */}
                <div className="w-[507px] shrink-0 border border-gray-200 p-10">
                    <h2 className="mb-10 font-beatrice text-[20px] font-bold text-black">
                        Order Summary
                    </h2>

                    <div className="mb-4 space-y-[20px]">
                        <div className="flex justify-between font-beatrice text-[16px]">
                            <span className="text-gray-500">Subtotal</span>
                            <span className=" text-black font-bold">
                                {SUBTOTAL.toLocaleString()} EGP
                            </span>
                        </div>
                        <div className="flex justify-between font-beatrice text-[16px]">
                            <span className="text-gray-500">Shipping</span>
                            <span className=" text-black font-bold">??</span>
                        </div>
                        <div className="flex justify-between font-beatrice text-[16px]">
                            <span className="text-gray-500">Discount</span>
                            <span className=" text-[#FF383C] font-bold">
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
                    <div className="flex items-start gap-3  border border-[#388E3C] bg-[#E8F5E9] p-5">
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
