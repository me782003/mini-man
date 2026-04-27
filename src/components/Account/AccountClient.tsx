'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useProfile, type Profile } from '@/lib/hooks/useProfile';
import { useChangePassword } from '@/lib/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/fetcher';

/* ─── Stat card ──────────────────────────────────────────────────────── */

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex flex-col items-center justify-center border border-gray-200 py-5 px-4 text-center">
            <span className="font-beatrice text-[28px] font-bold text-black">{value}</span>
            <span className="mt-1 font-beatrice text-[12px] text-[#616161] uppercase tracking-wide">{label}</span>
        </div>
    );
}

/* ─── Security section ───────────────────────────────────────────────── */

function SecuritySection() {
    const { mutate: changePassword, isPending, isSuccess, isError, error, reset } = useChangePassword();

    const [fields, setFields] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [fieldErrors, setFieldErrors] = useState<Partial<typeof fields>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFields((f) => ({ ...f, [e.target.name]: e.target.value }));
        setFieldErrors((fe) => ({ ...fe, [e.target.name]: undefined }));
        reset();
    };

    const validate = () => {
        const errors: Partial<typeof fields> = {};
        if (!fields.currentPassword)                      errors.currentPassword = 'Required';
        if (fields.newPassword.length < 8)                errors.newPassword     = 'Min. 8 characters';
        if (fields.confirmPassword !== fields.newPassword) errors.confirmPassword = 'Passwords do not match';
        return errors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length) { setFieldErrors(errors); return; }
        changePassword(
            { currentPassword: fields.currentPassword, newPassword: fields.newPassword },
            { onSuccess: () => setFields({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
        );
    };

    const apiError = isError && error instanceof Error ? error.message : null;

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h3 className="mb-6 font-beatrice text-[18px] font-bold text-black sm:text-[20px]">
                Security &amp; Access
            </h3>

            {isSuccess && (
                <div className="mb-5 border border-green-200 bg-green-50 px-4 py-3 font-cairo text-sm text-green-700">
                    ✓ Password changed successfully
                </div>
            )}
            {apiError && (
                <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 font-cairo text-sm text-red-600">
                    {apiError}
                </div>
            )}

            <div className="mb-8 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
                {([
                    { name: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
                    { name: 'newPassword',     label: 'New Password',     placeholder: 'Min. 8 characters' },
                    { name: 'confirmPassword', label: 'Confirm Password', placeholder: 'Repeat new password' },
                ] as const).map(({ name, label, placeholder }) => (
                    <div key={name}>
                        <label htmlFor={name} className="mb-2 block font-beatrice text-[13px] text-[#616161]">{label}</label>
                        <input
                            id={name} name={name} type="password"
                            value={fields[name]} placeholder={placeholder}
                            onChange={handleChange}
                            className={`w-full border-b bg-transparent pb-2 font-beatrice text-[15px] text-black placeholder:text-gray-300 focus:outline-none ${fieldErrors[name] ? 'border-red-400' : 'border-gray-300 focus:border-black'}`}
                        />
                        {fieldErrors[name] && <p className="mt-1 font-cairo text-xs text-red-500">{fieldErrors[name]}</p>}
                    </div>
                ))}
            </div>

            <hr className="mb-6 border-gray-200" />

            <div className="flex justify-end">
                <button
                    type="submit" disabled={isPending}
                    className="flex items-center justify-between gap-6 bg-black px-5 py-3.5 font-beatrice text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 sm:px-7"
                >
                    <span>{isPending ? 'Saving…' : 'Change Password'}</span>
                    <svg width="28" height="11" viewBox="0 0 37 14" fill="none">
                        <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </form>
    );
}

/* ─── Personal form ──────────────────────────────────────────────────── */

function PersonalPanel({ profile }: { profile: Profile | undefined }) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [saved, setSaved] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        if (!profile) return;
        const [firstName = '', ...rest] = profile.name.split(' ');
        setForm({ firstName, lastName: rest.join(' '), email: profile.email, phone: profile.phone });
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
        setApiError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setSaved(false);
        setApiError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setApiError(null);
        try {
            const token = localStorage.getItem('token') ?? '';
            const formData = new FormData();
            formData.append('name', `${form.firstName} ${form.lastName}`.trim());
            formData.append('email', form.email);
            if (avatarFile) formData.append('profile_picture', avatarFile);

            const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://mini-man.shaarapp.com';
            const res = await fetch(`${BASE_URL}/user/auth/profile`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text().catch(() => res.statusText);
                throw new ApiError(res.status, text);
            }

            await queryClient.invalidateQueries({ queryKey: ['profile'] });
            setAvatarFile(null);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setApiError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsPending(false);
        }
    };

    const avatar = avatarPreview ?? profile?.profile_picture ?? null;
    const initials = profile?.name?.[0]?.toUpperCase() ?? '?';

    return (
        <>
            <h1 className="mt-8 text-[30px] leading-tight font-bold text-black font-beatrice sm:mt-10 sm:text-[42px]">
                Personal Information
            </h1>
            <p className="mt-2 mb-6 text-[13px] text-gray-500 font-beatrice sm:mb-7 sm:text-[14px]">
                Update your details to ensure a seamless experience.
            </p>


            {/* Stats */}
            {profile && (
                <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard label="Orders"    value={profile.orders_numbers} />
                    <StatCard label="Favourites" value={profile.favourite_quantity} />
                    <StatCard label="Cart Items" value={profile.cart_quantity} />
                    <StatCard label="Addresses"  value={profile.addresses_number} />
                </div>
            )}

            <form onSubmit={handleSubmit} className="border border-gray-200 p-4 sm:p-6 md:p-8 lg:p-10">
                {/* Profile row */}
                <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
                    <div className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 sm:h-[128px] sm:w-[128px]">
                        {avatar ? (
                            <img src={avatar} alt={profile?.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center font-beatrice text-[40px] font-bold text-neutral-400">
                                {initials}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-beatrice text-[20px] font-medium text-black sm:text-[22px]">
                            {profile?.name ?? '—'}
                        </p>
                        <p className="mt-0.5 font-beatrice text-[12px] text-[#616161] sm:text-[13px]">
                            {profile?.email}
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-3 font-beatrice text-[10px] font-bold uppercase tracking-widest text-[#FF383C] underline underline-offset-2 transition-colors hover:text-red-600"
                        >
                            {avatarFile ? avatarFile.name : 'Change Photo'}
                        </button>
                    </div>
                </div>

                {/* Personal fields */}
                <div className="mb-8 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 md:gap-y-7">
                    {([
                        { name: 'firstName', label: 'First Name',    type: 'text',  disabled: false },
                        { name: 'lastName',  label: 'Last Name',     type: 'text',  disabled: false },
                        { name: 'email',     label: 'Email Address', type: 'email', disabled: false },
                        { name: 'phone',     label: 'Phone Number',  type: 'tel',   disabled: true  },
                    ] as const).map(({ name, label, type, disabled }) => (
                        <div key={name}>
                            <label htmlFor={name} className="mb-2 block font-beatrice text-[13px] text-[#616161]">
                                {label}
                            </label>
                            <input
                                id={name} name={name} type={type}
                                value={form[name]}
                                onChange={handleChange}
                                disabled={disabled}
                                className={`w-full border-b pb-2 font-beatrice text-[15px] focus:outline-none ${disabled ? 'cursor-not-allowed border-gray-200 bg-transparent text-gray-400' : 'border-gray-300 bg-transparent text-black focus:border-black'}`}
                            />
                        </div>
                    ))}
                </div>

                <hr className="mb-6 border-gray-200" />

                {/* Save profile button */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        {saved && (
                            <p className="font-cairo text-sm text-green-600">✓ Profile updated successfully</p>
                        )}
                        {apiError && (
                            <p className="font-cairo text-sm text-red-500">{apiError}</p>
                        )}
                    </div>
                    <div className="md:ms-auto">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center justify-between gap-6 bg-black px-5 py-3.5 font-beatrice text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 sm:px-7"
                        >
                            <span>{isPending ? 'Saving…' : 'Save Profile'}</span>
                            <svg width="28" height="11" viewBox="0 0 37 14" fill="none">
                                <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </form>

            {/* Security section — separate card */}
            <div className="mt-6 border border-gray-200 p-4 sm:p-6 md:p-8 lg:p-10">
                <SecuritySection />
            </div>
        </>
    );
}

/* ─── Main ───────────────────────────────────────────────────────────── */

export default function AccountClient() {
    const { data: profile, isPending, isError } = useProfile();

    return (
        <>
            <nav className="mb-[10px] flex items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">Home</Link>
                <span>/</span>
                <span className="font-semibold text-black">Account</span>
            </nav>

            <p className="font-beatrice font-bold text-[20px] uppercase text-black">Account</p>

            {isPending && (
                <div className="mt-16 flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
                </div>
            )}

            {isError && (
                <p className="mt-10 font-cairo text-sm text-red-500">Failed to load profile. Please try again.</p>
            )}

            {!isPending && <PersonalPanel profile={profile} />}
        </>
    );
}
