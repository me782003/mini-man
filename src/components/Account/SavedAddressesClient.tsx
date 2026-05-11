'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@/i18n/navigation';
import { Home } from 'lucide-react';
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from '@/lib/hooks/useAddresses';
import { useCountries } from '@/lib/hooks/useCountries';
import type { Address } from '@/lib/hooks/useProfile';

import AddressModal, { EMPTY_FORM, type AddressForm } from './AddressModal';

/* ─── Main component ─────────────────────────────────────────────────── */

export default function SavedAddressesClient() {
    const { data: addresses, isLoading } = useAddresses();
    const createAddress = useCreateAddress();
    const updateAddress = useUpdateAddress();
    const deleteAddress = useDeleteAddress();
    const setDefaultMutation = useSetDefaultAddress();

    const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; editId?: number }>({ open: false, mode: 'add' });
    const [form, setForm] = useState<AddressForm>(EMPTY_FORM);

    const addressList = addresses ?? [];

    function openAdd() {
        setForm(EMPTY_FORM);
        setModal({ open: true, mode: 'add' });
    }

    function openEdit(address: Address) {
        setForm({
            first_name: address.first_name,
            last_name: address.last_name,
            phone: address.phone,
            city: address.city,
            street_address: address.street_address,
            apartment: address.apartment ?? '',
            country_id: address.country_id,
            latitude: address.latitude ?? null,
            longitude: address.longitude ?? null,
            is_default: address.is_default === 1,
        });
        setModal({ open: true, mode: 'edit', editId: address.id });
    }

    function closeModal() {
        setModal(m => ({ ...m, open: false }));
    }

    function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleDefaultToggle() {
        setForm(prev => ({ ...prev, is_default: !prev.is_default }));
    }

    function handleSave() {
        if (modal.mode === 'add') {
            createAddress.mutate(form, { onSuccess: closeModal });
        } else if (modal.editId != null) {
            updateAddress.mutate({ id: modal.editId, ...form }, { onSuccess: closeModal });
        }
    }

    const saving = createAddress.isPending || updateAddress.isPending;

    return (
        <>
            <nav className="mb-[10px] flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
                <span className="font-semibold text-black">Account</span>
            </nav>

            <p className="font-beatrice text-[20px] font-bold uppercase text-black">Account</p>

            <div className="mb-6 mt-8 flex flex-col gap-4 sm:mb-7 sm:mt-10 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-[760px]">
                    <h1 className="font-beatrice text-[30px] font-bold leading-tight text-black sm:text-[42px]">
                        Saved Addresses
                    </h1>
                    <p className="mt-2 font-beatrice text-[13px] text-gray-500 sm:text-[14px]">
                        Curate your delivery locations for a seamless checkout experience.
                        Your primary address will be used as the default for all future shipments.
                    </p>
                </div>
                <button onClick={openAdd}
                    className="hidden w-auto shrink-0 border border-black px-6 py-2.5 font-beatrice text-[14px] font-medium text-black transition-colors hover:bg-black hover:text-white md:block">
                    + Add Address
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {addressList.map(address => (
                        <div key={address.id} className="border border-gray-200 p-5 sm:p-6">
                            <div className="mb-5 flex items-center justify-between">
                                {address.is_default === 1 ? (
                                    <span className="rounded-full bg-black px-4 py-1.5 font-beatrice text-[13px] font-medium text-white">Default</span>
                                ) : (
                                    <button
                                        onClick={() => setDefaultMutation.mutate(address.id)}
                                        disabled={setDefaultMutation.isPending}
                                        className="font-beatrice text-[13px] text-gray-400 underline underline-offset-2 hover:text-black disabled:opacity-50"
                                    >
                                        Set as default
                                    </button>
                                )}
                                <Home size={18} strokeWidth={1.5} className="text-gray-400" />
                            </div>

                            <p className="font-beatrice text-[20px] font-semibold text-black sm:text-[22px]">
                                {address.first_name} {address.last_name}
                            </p>
                            <p className="mt-2 font-beatrice text-[14px] text-gray-600">{address.street_address}</p>
                            {address.apartment && (
                                <p className="font-beatrice text-[14px] text-gray-600">{address.apartment}</p>
                            )}
                            <p className="font-beatrice text-[14px] text-gray-600">{address.city}</p>
                            {address.country_name && (
                                <p className="font-beatrice text-[14px] text-gray-600">{address.country_name}</p>
                            )}

                            <div className="mt-6 flex items-center gap-4">
                                <button onClick={() => openEdit(address)}
                                    className="font-beatrice text-[14px] font-medium text-black transition-colors hover:underline">
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteAddress.mutate(address.id)}
                                    disabled={deleteAddress.isPending}
                                    className="font-beatrice text-[14px] font-medium text-red-500 transition-colors hover:text-red-600 disabled:opacity-50">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {addressList.length === 0 && (
                        <p className="col-span-2 py-16 text-center font-beatrice text-[14px] text-gray-400">
                            No saved addresses yet.
                        </p>
                    )}
                </div>
            )}

            <button onClick={openAdd}
                className="mt-5 block w-full shrink-0 border border-black px-6 py-2.5 font-beatrice text-[14px] font-medium text-black transition-colors hover:bg-black hover:text-white md:hidden sm:w-auto">
                + Add Address
            </button>

            {modal.open && (
                <AddressModal
                    mode={modal.mode}
                    form={form}
                    onChange={handleFormChange}
                    onCountryChange={id => setForm(prev => ({ ...prev, country_id: id }))}
                    onDefaultToggle={handleDefaultToggle}
                    onSave={handleSave}
                    onClose={closeModal}
                    saving={saving}
                />
            )}
        </>
    );
}
