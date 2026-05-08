'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useCountries } from '@/lib/hooks/useCountries';

export interface AddressForm {
    first_name: string;
    last_name: string;
    city: string;
    street_address: string;
    apartment: string;
    country_id: number;
    is_default: boolean;
}

export const EMPTY_FORM: AddressForm = {
    first_name: '',
    last_name: '',
    city: '',
    street_address: '',
    apartment: '',
    country_id: 0,
    is_default: false,
};

interface AddressModalProps {
    mode: 'add' | 'edit';
    form: AddressForm;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCountryChange: (id: number) => void;
    onDefaultToggle: () => void;
    onSave: () => void;
    onClose: () => void;
    saving: boolean;
}

export default function AddressModal({
    mode,
    form,
    onChange,
    onCountryChange,
    onDefaultToggle,
    onSave,
    onClose,
    saving,
}: AddressModalProps) {
    const { data: countries = [] } = useCountries();
    const selectedCountry = countries.find(c => c.id === form.country_id);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-[650px] overflow-y-auto bg-white p-5 sm:p-6 md:p-8 lg:p-10">
                <h2 className="mb-6 font-beatrice text-[24px] font-bold text-black sm:mb-7 sm:text-[32px]">
                    {mode === 'add' ? 'Add Address' : 'Edit Address'}
                </h2>

                {/* First / Last name */}
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                        name="first_name"
                        value={form.first_name}
                        onChange={onChange}
                        placeholder="First Name"
                        className="border border-gray-300 px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                    />
                    <input
                        name="last_name"
                        value={form.last_name}
                        onChange={onChange}
                        placeholder="Last Name"
                        className="border border-gray-300 px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                    />
                </div>

                {/* Country select */}
                <div className="relative mb-4">
                    <select
                        value={form.country_id || ''}
                        onChange={e => onCountryChange(Number(e.target.value))}
                        className="w-full appearance-none border border-gray-300 bg-white px-4 py-3 font-beatrice text-[14px] text-black focus:border-black focus:outline-none"
                    >
                        <option value="" disabled>
                            Select Country
                        </option>
                        {countries.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    {selectedCountry ? (
                        <img
                            src={selectedCountry.flag_url}
                            alt={selectedCountry.name}
                            className="pointer-events-none absolute right-8 top-1/2 h-4 w-6 -translate-y-1/2 object-cover"
                        />
                    ) : null}
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ▾
                    </span>
                </div>

                {/* Street */}
                <input
                    name="street_address"
                    value={form.street_address}
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
                <label className="mb-7 flex cursor-pointer items-start gap-3 sm:items-center">
                    <button
                        type="button"
                        onClick={onDefaultToggle}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors ${form.is_default ? 'border-black bg-black' : 'border-gray-400 bg-white'
                            }`}
                    >
                        {form.is_default && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path
                                    d="M1 4L3.5 6.5L9 1"
                                    stroke="white"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                    </button>
                    <span className="font-beatrice text-[14px] font-semibold text-black">
                        Set as default shipping address
                    </span>
                </label>

                {/* Actions */}
                <div className="flex gap-3 sm:gap-4">
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex flex-1 items-center justify-between bg-black px-5 py-4 font-beatrice text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 sm:px-7 sm:text-[16px]"
                    >
                        <span>{saving ? 'Saving…' : 'Save Changes'}</span>
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
                    <button
                        onClick={onClose}
                        className="border border-gray-300 px-3 py-4 font-beatrice text-[15px] font-semibold text-black transition-colors hover:bg-gray-50 sm:px-10 sm:text-[16px] md:px-6"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
