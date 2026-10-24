'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from '@/lib/hooks/useAddresses';
import type { Address } from '@/lib/hooks/useProfile';

import CountryBadge from '@/components/Country/CountryBadge';
import AddressModal, { EMPTY_FORM, addressToForm, isAddressComplete, type AddressForm } from './AddressModal';

/* ─── Main component ─────────────────────────────────────────────────── */

export default function SavedAddressesClient() {
    const t = useTranslations('Orders');
    const ta = useTranslations('Account');
    const tc = useTranslations('Common');
    const { data: addresses, isPending: isLoading } = useAddresses();
    const createAddress = useCreateAddress();
    const updateAddress = useUpdateAddress();
    const deleteAddress = useDeleteAddress();
    const setDefaultMutation = useSetDefaultAddress();

    const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; editId?: number }>({ open: false, mode: 'add' });
    const [form, setForm] = useState<AddressForm>(EMPTY_FORM);

    const addressList = addresses ?? [];

    function openAdd() {
        createAddress.reset();
        setForm(EMPTY_FORM);
        setModal({ open: true, mode: 'add' });
    }

    function openEdit(address: Address) {
        updateAddress.reset();
        setForm(addressToForm(address));
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

    function handleSave(values: AddressForm) {
        if (modal.mode === 'add') {
            createAddress.mutate(values, { onSuccess: closeModal });
        } else if (modal.editId != null) {
            updateAddress.mutate({ id: modal.editId, ...values }, { onSuccess: closeModal });
        }
    }

    function handleDelete(id: number) {
        if (window.confirm(ta('confirmDeleteAddress'))) deleteAddress.mutate(id);
    }

    const saving = createAddress.isPending || updateAddress.isPending;
    const saveError = (modal.mode === 'add' ? createAddress.error : updateAddress.error)?.message ?? null;

    return (
        <>
            <nav className="mb-[10px] flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">{tc('home')}</Link>
                <span>/</span>
                <span className="font-semibold text-black">{tc('account')}</span>
            </nav>

            <p className="font-beatrice text-[20px] font-bold uppercase text-black">{tc('account')}</p>

            <div className="mb-6 mt-8 flex flex-col gap-4 sm:mb-7 sm:mt-10 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-[760px]">
                    <h1 className="font-beatrice text-[30px] font-bold leading-tight text-black sm:text-[42px]">
                        {ta('savedAddresses')}
                    </h1>
                    <p className="mt-2 font-beatrice text-[13px] text-gray-500 sm:text-[14px]">
                        {ta('savedAddressesHint')}
                    </p>
                </div>
                <button onClick={openAdd}
                    className="hidden w-auto shrink-0 border border-black px-6 py-2.5 font-beatrice text-[14px] font-medium text-black transition-colors hover:bg-black hover:text-white md:block">
                    + {ta('addAddress')}
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
                                    <span className="rounded-full bg-black px-4 py-1.5 font-beatrice text-[13px] font-medium text-white">{tc('default')}</span>
                                ) : (
                                    <button
                                        onClick={() => setDefaultMutation.mutate(address.id)}
                                        disabled={setDefaultMutation.isPending}
                                        className="font-beatrice text-[13px] text-gray-400 underline underline-offset-2 hover:text-black disabled:opacity-50"
                                    >
                                        {tc('setAsDefault')}
                                    </button>
                                )}
                                <Home size={18} strokeWidth={1.5} className="text-gray-400" />
                            </div>

                            <p className="font-beatrice text-[20px] font-semibold text-black sm:text-[22px]">
                                {address.first_name} {address.last_name}
                            </p>
                            {address.phone && (
                                <p dir="ltr" className="mt-1 font-beatrice text-[14px] text-gray-600 rtl:text-right">{address.phone}</p>
                            )}
                            <p className="mt-2 font-beatrice text-[14px] text-gray-600">
                                {[address.street_address, address.apartment, address.bosta_district_name, address.city]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                            <CountryBadge
                                countryId={address.country_id}
                                name={address.country_name}
                                className="mt-1 font-beatrice text-[14px] text-gray-600"
                            />

                            {!isAddressComplete(address) && (
                                <button
                                    onClick={() => openEdit(address)}
                                    className="mt-4 block w-full border border-amber-300 bg-amber-50 px-3 py-2 text-start font-beatrice text-[12px] font-medium text-amber-800"
                                >
                                    {t('completeAddress')}
                                </button>
                            )}

                            <div className="mt-6 flex items-center gap-4">
                                <button onClick={() => openEdit(address)}
                                    className="font-beatrice text-[14px] font-medium text-black transition-colors hover:underline">
                                    {tc('edit')}
                                </button>
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    disabled={deleteAddress.isPending}
                                    className="font-beatrice text-[14px] font-medium text-red-500 transition-colors hover:text-red-600 disabled:opacity-50">
                                    {tc('delete')}
                                </button>
                            </div>
                        </div>
                    ))}

                    {addressList.length === 0 && (
                        <div className="col-span-2 flex flex-col items-center py-16 text-center">
                            <p className="font-beatrice text-[14px] text-gray-500">{ta('noAddresses')}</p>
                            <button
                                onClick={openAdd}
                                className="mt-4 border border-black px-6 py-2.5 font-beatrice text-[14px] font-medium text-black transition-colors hover:bg-black hover:text-white"
                            >
                                + {ta('addAddress')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <button onClick={openAdd}
                className="mt-5 block w-full shrink-0 border border-black px-6 py-2.5 font-beatrice text-[14px] font-medium text-black transition-colors hover:bg-black hover:text-white md:hidden sm:w-auto">
                + {ta('addAddress')}
            </button>

            {modal.open && (
                <AddressModal
                    mode={modal.mode}
                    form={form}
                    onChange={handleFormChange}
                    onCountryChange={id => setForm(prev => ({ ...prev, country_id: id }))}
                    onFieldsChange={patch => setForm(prev => ({ ...prev, ...patch }))}
                    onDefaultToggle={handleDefaultToggle}
                    onSave={handleSave}
                    onClose={closeModal}
                    saving={saving}
                    error={saveError}
                    isFirstAddress={modal.mode === 'add' && addressList.length === 0}
                />
            )}
        </>
    );
}
