'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import AccountSidebar, { ActiveTab } from '@/components/Account/AccountSidebar';

/* ─── Personal Information form ──────────────────────────────────────── */

interface FormState {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currentPassword: string;
    newPassword: string;
}

/* ─── Tab panels ─────────────────────────────────────────────────────── */

function PersonalPanel() {
    const [form, setForm] = useState<FormState>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentPassword: '••••••••',
        newPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <>
            <h1 className="mt-8 text-[30px] leading-tight font-bold text-black font-beatrice sm:mt-10 sm:text-[42px]">
                Personal Information
            </h1>

            <p className="mt-2 mb-6 text-[13px] text-gray-500 font-beatrice sm:mb-7 sm:text-[14px]">
                Update your details to ensure a seamless Nourish experience.
            </p>

            <div className="border border-gray-200 p-4 sm:p-6 md:p-8 lg:p-10">
                {/* Profile row */}
                <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
                    <div className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 sm:h-[128px] sm:w-[128px]">
                        <Image
                            src="/images/avatar.jpg"
                            alt="Profile avatar"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div>
                        <p className="font-beatrice text-[20px] font-medium text-black sm:text-[22px]">
                            Alex Thompson
                        </p>
                        <p className="mt-0.5 font-beatrice text-[12px] text-[#616161] sm:text-[13px]">
                            Member since November 2023
                        </p>
                        <button className="mt-3 font-beatrice text-[10px] font-bold uppercase tracking-widest text-[#FF383C] underline underline-offset-2 transition-colors hover:text-red-600">
                            Change Photo
                        </button>
                    </div>
                </div>

                {/* Personal fields */}
                <div className="mb-8 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 md:gap-y-7">
                    {[
                        { name: 'firstName', label: 'First Name', type: 'text' },
                        { name: 'lastName', label: 'Last Name', type: 'text' },
                        { name: 'email', label: 'Email Address', type: 'email' },
                        { name: 'phone', label: 'Phone Number', type: 'tel' },
                    ].map(({ name, label, type }) => (
                        <div key={name}>
                            <label
                                htmlFor={name}
                                className="mb-2 block font-beatrice text-[13px] text-[#616161]"
                            >
                                {label}
                            </label>
                            <input
                                id={name}
                                name={name}
                                type={type}
                                value={form[name as keyof FormState]}
                                onChange={handleChange}
                                className="w-full border-b border-gray-300 bg-transparent pb-2 font-beatrice text-[15px] text-black focus:border-black focus:outline-none"
                            />
                        </div>
                    ))}
                </div>

                <hr className="mb-7 border-gray-200" />

                {/* Security & Access */}
                <h3 className="mb-6 font-beatrice text-[18px] font-bold text-black sm:text-[20px]">
                    Security &amp; Access
                </h3>

                <div className="mb-8 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="mb-2 block font-beatrice text-[13px] text-[#616161]"
                        >
                            Current Password
                        </label>
                        <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={form.currentPassword}
                            onChange={handleChange}
                            className="w-full border-b border-gray-300 bg-transparent pb-2 font-beatrice text-[15px] text-black focus:border-black focus:outline-none"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="newPassword"
                            className="mb-2 block font-beatrice text-[13px] text-[#616161]"
                        >
                            New Password
                        </label>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={form.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            className="w-full border-b border-gray-300 bg-transparent pb-2 font-beatrice text-[15px] text-black placeholder:text-gray-300 focus:border-black focus:outline-none"
                        />
                    </div>
                </div>

                <hr className="mb-6 border-gray-200" />

                {/* Footer */}
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
                    <p className="max-w-[400px] font-beatrice text-[13px] leading-relaxed text-gray-500">
                        By clicking &ldquo;Save Changes&rdquo;, you agree to our privacy
                        policy and updated terms of service regarding data editorial practices.
                    </p>

                    <button className="flex w-full items-center justify-between gap-6 bg-black px-5 py-3.5 font-beatrice text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 sm:px-7 sm:text-[16px] md:w-auto md:shrink-0">
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
        </>
    );
}
/* ─── Main component ─────────────────────────────────────────────────── */

export default function AccountClient() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="container">
            {/* Hamburger trigger — mobile/tablet only */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="mb-4 flex items-center gap-2 font-beatrice text-[14px] text-black lg:hidden"
                aria-label="Open account menu"
            >
                <Menu size={20} />
                <span>Account Menu</span>
            </button>

            {/* Backdrop overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex gap-8">
                <AccountSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

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

                    {activeTab === 'personal' && <PersonalPanel />}
                </main>
            </div>
        </div>
    );
}
