'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@/i18n/navigation';
import { Home } from 'lucide-react';
import AccountSidebar from '@/components/Account/AccountSidebar';

interface Address {
    id: string;
    firstName: string;
    lastName: string;
    country: string;
    street: string;
    apartment: string;
    city: string;
    isDefault: boolean;
}

interface AddressForm {
    firstName: string;
    lastName: string;
    country: string;
    street: string;
    apartment: string;
    city: string;
    isDefault: boolean;
}

const EMPTY_FORM: AddressForm = {
    firstName: '',
    lastName: '',
    country: '',
    street: '',
    apartment: '',
    city: '',
    isDefault: false,
};

const INITIAL_ADDRESSES: Address[] = [
    {
        id: '1',
        firstName: 'Jane',
        lastName: 'Doe',
        country: 'United Kingdom',
        street: '123 Skincare Lane',
        apartment: '',
        city: 'London, W1F 8TB',
        isDefault: true,
    },
    {
        id: '2',
        firstName: 'Jane',
        lastName: 'Doe',
        country: 'United Kingdom',
        street: '123 Skincare Lane',
        apartment: '',
        city: 'London, W1F 8TB',
        isDefault: false,
    },
];

const COUNTRIES = [
    'Egypt', 'United Kingdom', 'United States', 'Saudi Arabia',
    'UAE', 'France', 'Germany', 'Canada', 'Australia',
];

/* ─── Address Modal ──────────────────────────────────────────────────── */

interface AddressModalProps {
    mode: 'add' | 'edit';
    form: AddressForm;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onDefaultToggle: () => void;
    onSave: () => void;
    onClose: () => void;
}

function AddressModal({ mode, form, onChange, onDefaultToggle, onSave, onClose }: AddressModalProps) {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-[650px] bg-white p-10 mx-4">
                <h2 className="font-beatrice text-[32px] font-bold text-black mb-7">
                    {mode === 'add' ? 'Add Address' : 'Edit Address'}
                </h2>

                {/* First / Last name */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                        name="firstName"
                        value={form.firstName}
                        onChange={onChange}
                        placeholder="First Name"
                        className="border border-gray-300 px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                    />
                    <input
                        name="lastName"
                        value={form.lastName}
                        onChange={onChange}
                        placeholder="Last Name"
                        className="border border-gray-300 px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                    />
                </div>

                {/* Country */}
                <div className="relative mb-4">
                    <select
                        name="country"
                        value={form.country}
                        onChange={onChange}
                        className="w-full appearance-none border border-gray-300 px-4 py-3 font-beatrice text-[14px] text-black focus:border-black focus:outline-none bg-white"
                    >
                        <option value="" disabled>Country</option>
                        {COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        ▾
                    </span>
                </div>

                {/* Street */}
                <input
                    name="street"
                    value={form.street}
                    onChange={onChange}
                    placeholder="Street Address"
                    className="mb-4 w-full border border-gray-300 px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                />

                {/* Apartment */}
                <input
                    name="apartment"
                    value={form.apartment}
                    onChange={onChange}
                    placeholder="Apartment, suite, etc. (optional)"
                    className="mb-4 w-full border border-gray-300 px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                />

                {/* City */}
                <input
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    placeholder="City"
                    className="mb-6 w-full border border-gray-300 px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                />

                {/* Default checkbox */}
                <label className="mb-7 flex cursor-pointer items-center gap-3">
                    <button
                        type="button"
                        onClick={onDefaultToggle}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors ${form.isDefault ? 'border-black bg-black' : 'border-gray-400 bg-white'
                            }`}
                    >
                        {form.isDefault && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                    <span className="font-beatrice text-[14px] font-semibold text-black">
                        Set as default shipping address
                    </span>
                </label>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={onSave}
                        className="flex flex-1 items-center justify-between bg-black px-7 py-4 font-beatrice text-[16px] font-semibold text-white transition-colors hover:bg-neutral-800"
                    >
                        <span>Save Changes</span>
                        <svg width="28" height="11" viewBox="0 0 37 14" fill="none">
                            <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button
                        onClick={onClose}
                        className="border border-gray-300 px-10 py-4 font-beatrice text-[16px] font-semibold text-black transition-colors hover:bg-gray-50"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* ─── Main component ─────────────────────────────────────────────────── */

export default function SavedAddressesClient() {
    const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
    const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; editId?: string }>({
        open: false,
        mode: 'add',
    });
    const [form, setForm] = useState<AddressForm>(EMPTY_FORM);

    function openAdd() {
        setForm(EMPTY_FORM);
        setModal({ open: true, mode: 'add' });
    }

    function openEdit(address: Address) {
        setForm({
            firstName: address.firstName,
            lastName: address.lastName,
            country: address.country,
            street: address.street,
            apartment: address.apartment,
            city: address.city,
            isDefault: address.isDefault,
        });
        setModal({ open: true, mode: 'edit', editId: address.id });
    }

    function closeModal() {
        setModal(m => ({ ...m, open: false }));
    }

    function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleDefaultToggle() {
        setForm(prev => ({ ...prev, isDefault: !prev.isDefault }));
    }

    function handleSave() {
        if (modal.mode === 'add') {
            const newId = String(Date.now());
            setAddresses(prev => {
                const updated = form.isDefault
                    ? prev.map(a => ({ ...a, isDefault: false }))
                    : prev;
                return [...updated, { id: newId, ...form }];
            });
        } else {
            setAddresses(prev =>
                prev.map(a => {
                    if (a.id === modal.editId) return { ...a, ...form };
                    // clear default on others if this one is now default
                    if (form.isDefault) return { ...a, isDefault: false };
                    return a;
                })
            );
        }
        closeModal();
    }

    function handleDelete(id: string) {
        setAddresses(prev => prev.filter(a => a.id !== id));
    }

    return (
        <>
            <div className="container mx-auto py-8">
                <div className="flex gap-8">
                    <AccountSidebar />

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

                        <div className="mt-10 mb-7 flex items-end justify-between">
                            <div>
                                <h1 className="font-beatrice text-[42px] font-bold leading-tight text-black">
                                    Saved Addresses
                                </h1>
                                <p className="mt-2 font-beatrice text-[14px] text-gray-500">
                                    Curate your delivery locations for a seamless checkout experience.
                                    Your primary address will be used as the default for all future
                                    editorial shipments.
                                </p>
                            </div>
                            <button
                                onClick={openAdd}
                                className="shrink-0 border border-black px-6 py-2.5 font-beatrice text-[14px] font-medium text-black transition-colors hover:bg-black hover:text-white"
                            >
                                + Add Address
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {addresses.map(address => (
                                <div key={address.id} className="border border-gray-200 p-6">
                                    {/* Card header */}
                                    <div className="mb-5 flex items-center justify-between">
                                        {address.isDefault ? (
                                            <span className="rounded-full bg-black px-4 py-1.5 font-beatrice text-[13px] font-medium text-white">
                                                Default
                                            </span>
                                        ) : (
                                            <span />
                                        )}
                                        <Home size={18} strokeWidth={1.5} className="text-gray-400" />
                                    </div>

                                    {/* Address details */}
                                    <p className="font-beatrice text-[22px] font-semibold text-black">
                                        {address.firstName} {address.lastName}
                                    </p>
                                    <p className="mt-2 font-beatrice text-[14px] text-gray-600">
                                        {address.street}
                                    </p>
                                    {address.apartment && (
                                        <p className="font-beatrice text-[14px] text-gray-600">
                                            {address.apartment}
                                        </p>
                                    )}
                                    <p className="font-beatrice text-[14px] text-gray-600">
                                        {address.city}
                                    </p>
                                    <p className="font-beatrice text-[14px] text-gray-600">
                                        {address.country}
                                    </p>

                                    {/* Actions */}
                                    <div className="mt-6 flex items-center gap-4">
                                        <button
                                            onClick={() => openEdit(address)}
                                            className="font-beatrice text-[14px] font-medium text-black transition-colors hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="font-beatrice text-[14px] font-medium text-red-500 transition-colors hover:text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>

            {modal.open && (
                <AddressModal
                    mode={modal.mode}
                    form={form}
                    onChange={handleFormChange}
                    onDefaultToggle={handleDefaultToggle}
                    onSave={handleSave}
                    onClose={closeModal}
                />
            )}
        </>
    );
}
