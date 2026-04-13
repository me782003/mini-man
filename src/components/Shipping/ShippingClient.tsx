'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import CheckoutStepper from '@/components/CheckoutStepper';
import OrderSummary, { SecurePaymentBadge } from '@/components/OrderSummary';

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="container ">
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex items-center gap-1 font-beatrice text-[14px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
                <Link href="/cart" className="transition-colors hover:text-black">Shopping Cart</Link>
                <span>/</span>
                <span className="font-semibold text-black">Shipping</span>
            </nav>

            {/* Heading */}
            <h1 className="mb-5 md:mb-10 font-beatrice text-[20px] font-bold uppercase  text-black">
                Shipping
            </h1>

            {/* Progress stepper */}
            <CheckoutStepper currentStep={currentStep} />

            {true && <div className="flex flex-col md:flex-row gap-5 md:gap-10 ">
                {/* Delivery Information form */}
                <div className="flex-1 w-full border border-gray-200 p-5 md:p-10">
                    <h2 className="mb-5 md:mb-10 font-beatrice text-[20px] font-bold text-black">
                        Delivery Information
                    </h2>

                    <div className="flex flex-col md:grid grid-cols-1 md:grid-cols-2 gap-[10px] md:gap-4">

                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={form.firstName}
                            onChange={handleChange}
                            className="border w-full border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] md:text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={form.lastName}
                            onChange={handleChange}
                            className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] md:text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] md:text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] md:text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={form.country}
                            onChange={handleChange}
                            className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] md:text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={form.city}
                            onChange={handleChange}
                            className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] md:text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Address in Details"
                            value={form.address}
                            onChange={handleChange}
                            className="col-span-2 border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] md:text-[14px] placeholder:text-gray-400 focus:border-black focus:outline-none"
                        />
                    </div>

                    <Link href="/payment" className="mt-6 hidden md:flex w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[20px] font-semibold  text-white transition-colors hover:bg-neutral-800">
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
                    </Link>
                </div>

                {/* Order Summary */}
                <OrderSummary
                    subtotal={SUBTOTAL}
                    discount={FIXED_DISCOUNT}
                    className="md:w-[507px] shrink-0 bg-[#E0E0E080] md:bg-transparent md:border border-gray-200 p-5 md:p-10"
                >
                    <SecurePaymentBadge />
                </OrderSummary>
                <Link href="/payment" className=" flex md:hidden w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[16px] md:text-[20px] font-semibold  text-white transition-colors hover:bg-neutral-800">
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
                </Link>
            </div>}
        </div>
    );
}
