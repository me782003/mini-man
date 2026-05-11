'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import CheckoutStepper from '@/components/CheckoutStepper';
import OrderSummary, { SecurePaymentBadge } from '@/components/OrderSummary';
import { useAuthState } from '@/lib/hooks/useAuthState';
import { useCart } from '@/lib/hooks/useCart';
import { useValidateCoupon } from '@/lib/hooks/useOrders';
import type { Address } from '@/lib/hooks/useProfile';
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from '@/lib/hooks/useAddresses';
import AddressModal, { EMPTY_FORM, type AddressForm } from '@/components/Account/AddressModal';


function AddressCard({
    address,
    onSelect,
    onEdit,
    onDelete,
    onSetDefault,
    selected,
    deleting,
    settingDefault,
}: {
    address: Address;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onSetDefault: () => void;
    selected: boolean;
    deleting: boolean;
    settingDefault: boolean;
}) {
    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer border p-4 transition-colors ${selected ? 'border-black' : 'border-gray-200 hover:border-gray-400'}`}
        >
            <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 shrink-0 rounded-full border-2 ${selected ? 'border-black bg-black' : 'border-gray-400'}`} />
                    <span className="font-beatrice text-[14px] font-semibold text-black">
                        {address.first_name} {address.last_name}
                    </span>
                    {address.is_default === 1 && (
                        <span className="rounded bg-black px-2 py-0.5 font-beatrice text-[10px] text-white">Default</span>
                    )}
                </div>
                <div className="flex shrink-0 gap-3">
                    <button
                        onClick={e => { e.stopPropagation(); onEdit(); }}
                        className="font-beatrice text-[12px] text-gray-500 underline underline-offset-2 hover:text-black"
                    >
                        Edit
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(); }}
                        disabled={deleting}
                        className="font-beatrice text-[12px] text-red-500 underline underline-offset-2 hover:text-red-700 disabled:opacity-50"
                    >
                        {deleting ? '…' : 'Delete'}
                    </button>
                </div>
            </div>
            <p className="pl-6 font-beatrice text-[13px] text-gray-600">
                {address.street_address}{address.apartment ? `, ${address.apartment}` : ''}, {address.city}
                {address.country_name ? `, ${address.country_name}` : ''}
            </p>
            {address.is_default !== 1 && (
                <button
                    onClick={e => { e.stopPropagation(); onSetDefault(); }}
                    disabled={settingDefault}
                    className="mt-2 pl-6 font-beatrice text-[12px] text-gray-500 underline underline-offset-2 hover:text-black disabled:opacity-50"
                >
                    {settingDefault ? 'Setting…' : 'Set as default'}
                </button>
            )}
        </div>
    );
}

export default function ShippingClient() {
    const searchParams = useSearchParams();
    const appliedCoupon = searchParams.get('coupon') ?? '';
    const paymentHref = appliedCoupon ? `/payment?coupon=${encodeURIComponent(appliedCoupon)}` : '/payment';

    const { isLoggedIn } = useAuthState();
    const { data: cartData, isLoading: cartLoading } = useCart();

    const subtotal = Number(cartData?.data?.summary?.subtotal ?? 0);
    const validateCoupon = useValidateCoupon();

    React.useEffect(() => {
        if (appliedCoupon && subtotal > 0) {
            validateCoupon.mutate({ code: appliedCoupon, cart_amount: subtotal });
        }
    }, [appliedCoupon, subtotal]);

    const discountAmount = validateCoupon.data
        ? (() => {
            const c = validateCoupon.data.data;
            if (c.type === 'percentage') {
                const d = (subtotal * parseFloat(c.value)) / 100;
                return Math.min(d, parseFloat(c.max_discount));
            }
            return parseFloat(c.value);
        })()
        : 0;

    const { data: addresses, isLoading: profileLoading } = useAddresses();

    const createAddress = useCreateAddress();
    const updateAddress = useUpdateAddress();
    const deleteAddress = useDeleteAddress();
    const setDefault = useSetDefaultAddress();

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; editId?: number }>({ open: false, mode: 'add' });
    const [formState, setFormState] = useState<AddressForm>(EMPTY_FORM);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);

    // Guest delivery form
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        country: '', city: '', address: '',
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const addressList = addresses ?? [];

    // Auto-select default address
    const effectiveSelectedId = selectedAddressId
        ?? addressList.find(a => a.is_default === 1)?.id
        ?? addressList[0]?.id
        ?? null;

    const handleSave = () => {
        if (modal.mode === 'add') {
            createAddress.mutate(formState, { onSuccess: () => setModal(m => ({ ...m, open: false })) });
        } else if (modal.editId != null) {
            updateAddress.mutate({ id: modal.editId, ...formState }, { onSuccess: () => setModal(m => ({ ...m, open: false })) });
        }
    };

    const openAdd = () => {
        setFormState(EMPTY_FORM);
        setModal({ open: true, mode: 'add' });
    };

    const openEdit = (address: Address) => {
        setFormState({
            first_name: address.first_name,
            last_name: address.last_name,
            phone: address.phone ?? '',
            city: address.city,
            street_address: address.street_address,
            apartment: address.apartment ?? '',
            country_id: address.country_id,
            latitude: address.latitude ?? null,
            longitude: address.longitude ?? null,
            is_default: address.is_default === 1,
        });
        setModal({ open: true, mode: 'edit', editId: address.id });
    };

    const handleDelete = (id: number) => {
        setDeletingId(id);
        deleteAddress.mutate(id, { onSettled: () => setDeletingId(null) });
    };

    const handleSetDefault = (id: number) => {
        setSettingDefaultId(id);
        setDefault.mutate(id, { onSettled: () => setSettingDefaultId(null) });
    };

    return (
        <div className="container">
            {/* Breadcrumb */}
            <nav className="mb-[10px] flex items-center gap-1 font-beatrice text-[14px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
                <Link href="/cart" className="transition-colors hover:text-black">Shopping Cart</Link>
                <span>/</span>
                <span className="font-semibold text-black">Shipping</span>
            </nav>

            <h1 className="mb-5 font-beatrice text-[20px] font-bold uppercase text-black md:mb-10">
                Shipping
            </h1>

            <CheckoutStepper currentStep={0} />

            <div className="flex flex-col gap-5 md:flex-row md:gap-10">
                {/* Left panel */}
                <div className="flex-1 w-full border border-gray-200 p-5 md:p-10">
                    {isLoggedIn ? (
                        <>
                            <div className="mb-5 flex items-center justify-between md:mb-8">
                                <h2 className="font-beatrice text-[20px] font-bold text-black">
                                    Saved Addresses
                                </h2>
                                <button
                                    onClick={openAdd}
                                    className="font-beatrice text-[13px] font-semibold text-black underline underline-offset-2 hover:text-gray-600"
                                >
                                    + Add New
                                </button>
                            </div>

                            {profileLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {addressList.map(address => (
                                        <AddressCard
                                            key={address.id}
                                            address={address}
                                            selected={effectiveSelectedId === address.id}
                                            onSelect={() => setSelectedAddressId(address.id)}
                                            onEdit={() => openEdit(address)}
                                            onDelete={() => handleDelete(address.id)}
                                            onSetDefault={() => handleSetDefault(address.id)}
                                            deleting={deletingId === address.id}
                                            settingDefault={settingDefaultId === address.id}
                                        />
                                    ))}

                                    {addressList.length === 0 && (
                                        <p className="py-6 text-center font-beatrice text-[14px] text-gray-400">
                                            No saved addresses. Add one to continue.
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h2 className="mb-5 font-beatrice text-[20px] font-bold text-black md:mb-10">
                                Delivery Information
                            </h2>
                            <div className="flex flex-col gap-[10px] md:grid md:grid-cols-2 md:gap-4">
                                <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange}
                                    className="border w-full border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] placeholder:text-gray-400 focus:border-black focus:outline-none md:text-[14px]" />
                                <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange}
                                    className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] placeholder:text-gray-400 focus:border-black focus:outline-none md:text-[14px]" />
                                <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange}
                                    className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] placeholder:text-gray-400 focus:border-black focus:outline-none md:text-[14px]" />
                                <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange}
                                    className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] placeholder:text-gray-400 focus:border-black focus:outline-none md:text-[14px]" />
                                <input type="text" name="country" placeholder="Country" value={form.country} onChange={handleChange}
                                    className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] placeholder:text-gray-400 focus:border-black focus:outline-none md:text-[14px]" />
                                <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange}
                                    className="border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] placeholder:text-gray-400 focus:border-black focus:outline-none md:text-[14px]" />
                                <input type="text" name="address" placeholder="Address in Details" value={form.address} onChange={handleChange}
                                    className="col-span-2 border border-[#E0E0E0] px-4 py-3 font-beatrice text-[12px] placeholder:text-gray-400 focus:border-black focus:outline-none md:text-[14px]" />
                            </div>
                        </>
                    )}

                    <Link
                        href={paymentHref}
                        className="mt-6 hidden w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[20px] font-semibold text-white transition-colors hover:bg-neutral-800 md:flex"
                    >
                        <span>Continue to delivery</span>
                        <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
                            <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

                {/* Order Summary */}
                <OrderSummary
                    summary={cartData?.data?.summary}
                    isLoading={cartLoading}
                    couponCode={appliedCoupon || undefined}
                    discountAmount={discountAmount || undefined}
                    className="md:w-[507px] shrink-0 bg-[#E0E0E080] p-5 md:border md:border-gray-200 md:bg-transparent md:p-10"
                >
                    {appliedCoupon && (
                        <div className="mb-5 flex items-center gap-2 border border-green-300 bg-green-50 px-4 py-3">
                            <span className="font-beatrice text-[13px] font-semibold text-green-700">
                                Coupon applied: <span className="uppercase">{appliedCoupon}</span>
                            </span>
                        </div>
                    )}
                    <SecurePaymentBadge />
                </OrderSummary>

                <Link
                    href={paymentHref}
                    className="flex w-full items-center justify-between bg-black px-5 py-3 font-beatrice text-[16px] font-semibold text-white transition-colors hover:bg-neutral-800 md:hidden"
                >
                    <span>Continue to delivery</span>
                    <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
                        <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
            </div>

            {modal.open && (
                <AddressModal
                    mode={modal.mode}
                    form={formState}
                    onChange={e => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    onCountryChange={id => setFormState(prev => ({ ...prev, country_id: id }))}
                    onDefaultToggle={() => setFormState(prev => ({ ...prev, is_default: !prev.is_default }))}
                    onSave={handleSave}
                    onClose={() => setModal(m => ({ ...m, open: false }))}
                    saving={createAddress.isPending || updateAddress.isPending}
                />
            )}
        </div>
    );
}
