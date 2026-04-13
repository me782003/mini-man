'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { FooterFacebookIcon, FooterInstagramIcon } from '../icons';

function XIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
    );
}

export default function ContactClient() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: wire up form submission
    };

    return (
        <div className="container">
            {/* Breadcrumb */}
            <nav className="mb-2 flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">
                    Home
                </Link>
                <span>/</span>
                <span className="text-black">Contact</span>
            </nav>

            {/* Section label */}
            <h2 className="mb-4 font-beatrice text-[20px] font-bold uppercase text-black">
                Contact
            </h2>

            <div className="relative">
                {/* Social icons */}
                <div className="mb-6 flex items-center gap-4 md:absolute md:right-0 md:top-0 md:mb-0 md:flex-col md:gap-5">
                    <a href="#" aria-label="Facebook">
                        <FooterFacebookIcon className="h-6 w-6" />
                    </a>
                    <a href="#" aria-label="X (Twitter)">
                        <XIcon className="h-6 w-6 text-black" />
                    </a>
                    <a href="#" aria-label="Instagram">
                        <FooterInstagramIcon className="h-6 w-6" />
                    </a>
                </div>

                {/* Headline */}
                <h1 className="mb-8 max-w-5xl font-beatrice text-[30px] font-extrabold leading-[1.1] text-black sm:text-[38px] lg:mb-10 lg:text-[48px]">
                    Get in touch with us. Always here for your steps &amp; style.
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6 lg:gap-10">
                    {/* Row 1 */}
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={form.firstName}
                            onChange={handleChange}
                            className="w-full flex-1 border border-gray-300 px-4 py-3 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none sm:py-4"
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={form.lastName}
                            onChange={handleChange}
                            className="w-full flex-1 border border-gray-300 px-4 py-3 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none sm:py-4"
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full flex-1 border border-gray-300 px-4 py-3 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none sm:py-4"
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full flex-1 border border-gray-300 px-4 py-3 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none sm:py-4"
                        />
                    </div>

                    {/* Message */}
                    <textarea
                        name="message"
                        placeholder="Message"
                        rows={6}
                        value={form.message}
                        onChange={handleChange}
                        className="min-h-[180px] w-full resize-none border border-gray-300 px-4 py-3 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none sm:py-4"
                    />

                    {/* Submit */}
                    <div>
                        <button
                            type="submit"
                            className="flex w-full items-center justify-between gap-4 bg-black px-5 py-3 font-beatrice text-[16px] font-semibold text-white transition-colors hover:bg-neutral-800 sm:px-6 sm:text-[18px] md:w-auto md:min-w-[475px] md:py-2 md:text-[20px]"
                        >
                            <span>Leave us a Message</span>
                            <svg
                                width="37"
                                height="14"
                                viewBox="0 0 37 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="shrink-0"
                            >
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
                </form>
            </div>
        </div>
    );
}