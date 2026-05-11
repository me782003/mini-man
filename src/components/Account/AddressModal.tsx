'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check } from 'lucide-react';
import { useCountries } from '@/lib/hooks/useCountries';

export interface AddressForm {
    first_name: string;
    last_name: string;
    phone: string;
    city: string;
    street_address: string;
    apartment: string;
    country_id: number;
    latitude: number | null;
    longitude: number | null;
    is_default: boolean;
}

export const EMPTY_FORM: AddressForm = {
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    street_address: '',
    apartment: '',
    country_id: 0,
    latitude: null,
    longitude: null,
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
    const singleCountry = countries.length === 1;

    if (typeof document === 'undefined') return null;

    console.log("form", form);

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

                {/* Phone */}
                <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="Phone Number"
                    className="mb-4 w-full border border-gray-300 px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
                />

                {/* Country select */}
                <div className="mb-4">
                    <CountryCombobox
                        countries={countries}
                        value={form.country_id}
                        onChange={onCountryChange}
                        disabled={singleCountry}
                    />
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

interface CountryComboboxProps {
    countries: import('@/lib/hooks/useCountries').Country[];
    value: number;
    onChange: (id: number) => void;
    disabled?: boolean;
}

function CountryCombobox({ countries, value, onChange, disabled }: CountryComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = countries.find(c => c.id === value);
    const filtered = countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (countries.length === 1 && value !== countries[0].id) {
            onChange(countries[0].id);
        }
    }, [countries]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => { setOpen(v => !v); setSearch(''); }}
                className={`flex w-full items-center justify-between border px-4 py-3 font-beatrice text-[14px] transition-colors ${open ? 'border-black' : 'border-gray-300'} ${disabled ? 'cursor-not-allowed bg-gray-50 opacity-70' : 'bg-white hover:border-gray-400'}`}
            >
                <span className="flex items-center gap-2">
                    {selected ? (
                        <>
                            <img src={selected.flag_url} alt={selected.name} className="h-4 w-6 object-cover" />
                            <span className="text-black">{selected.name}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">Select Country</span>
                    )}
                </span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-full z-50 border border-t-0 border-gray-300 bg-white shadow-lg">
                    <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
                        <Search size={14} className="shrink-0 text-gray-400" />
                        <input
                            ref={inputRef}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search country…"
                            className="w-full font-beatrice text-[13px] text-black placeholder:text-gray-400 outline-none"
                        />
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <li className="px-4 py-3 font-beatrice text-[13px] text-gray-400">No results</li>
                        ) : (
                            filtered.map(c => (
                                <li key={c.id}>
                                    <button
                                        type="button"
                                        onClick={() => { onChange(c.id); setOpen(false); setSearch(''); }}
                                        className="flex w-full items-center justify-between px-4 py-2.5 font-beatrice text-[14px] text-black transition-colors hover:bg-gray-50"
                                    >
                                        <span className="flex items-center gap-2">
                                            <img src={c.flag_url} alt={c.name} className="h-4 w-6 object-cover" />
                                            {c.name}
                                        </span>
                                        {c.id === value && <Check size={14} className="text-black" />}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
