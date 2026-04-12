'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
            <h1 className="mt-10 font-beatrice text-[42px] font-bold leading-tight text-black">
                Personal Information
            </h1>
            <p className="mt-2 mb-7 font-beatrice text-[14px] text-gray-500">
                Update your details to ensure a seamless Nourish experience.
            </p>

            <div className="border border-gray-200 p-10">
                {/* Profile row */}
                <div className="mb-8 flex items-center gap-6">
                    <div className="relative h-[128px] w-[128px] shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                        <Image
                            src="/images/avatar.jpg"
                            alt="Profile avatar"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <p className="font-beatrice text-[22px] font-medium text-black">
                            Alex Thompson
                        </p>
                        <p className="mt-0.5 font-beatrice text-[13px] text-[#616161]">
                            Member since November 2023
                        </p>
                        <button className="mt-3 font-beatrice text-[10px] font-bold uppercase tracking-widest text-[#FF383C] underline underline-offset-2 transition-colors hover:text-red-600">
                            Change Photo
                        </button>
                    </div>
                </div>

                {/* Personal fields */}
                <div className="mb-8 grid grid-cols-2 gap-x-10 gap-y-7">
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

                <hr className="border-gray-200 mb-7" />

                {/* Security & Access */}
                <h3 className="mb-6 font-beatrice text-[20px] font-bold text-black">
                    Security &amp; Access
                </h3>

                <div className="mb-8 grid grid-cols-2 gap-x-10">
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

                <hr className="border-gray-200 mb-6" />

                {/* Footer */}
                <div className="flex items-center justify-between gap-8">
                    <p className="max-w-[400px] font-beatrice text-[13px] leading-relaxed text-gray-500">
                        By clicking &ldquo;Save Changes&rdquo;, you agree to our privacy
                        policy and updated terms of service regarding data editorial practices.
                    </p>
                    <button className="flex shrink-0 items-center gap-6 bg-black px-7 py-3.5 font-beatrice text-[16px] font-semibold text-white transition-colors hover:bg-neutral-800">
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

    return (
        <div className="container mx-auto py-8">
            <div className="flex gap-8">
                <AccountSidebar activeTab={activeTab} onTabChange={setActiveTab} />

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
