'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { post } from '@/lib/fetcher';
import { Link } from '@/i18n/navigation';
import { useSettings } from '@/lib/hooks/useSettings';
import { normalizeEgyptianPhone, isEgyptianMobile } from '@/lib/countries';
import SocialLinks from '@/components/Site/SocialLinks';
import ContactList from '@/components/Site/ContactList';
import { MapPin } from 'lucide-react';

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', message: '' };
type Field = keyof typeof EMPTY;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactClient() {
    const t = useTranslations('Site');
    const tc = useTranslations('Common');
    const [form, setForm] = useState(EMPTY);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

    const { data: settingsData } = useSettings();
    const contacts = settingsData?.data?.contacts;
    const socials = contacts?.socials ?? [];
    const branches = (settingsData?.data?.branches ?? []).filter(b => b.name);

    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: (payload: typeof EMPTY) =>
            post('/user/pages/contact-us', payload),
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
        setSubmitted(false);
    };

    // The API needs all five fields (camelCase) and answers 400 "All fields are required" otherwise.
    const validate = () => {
        const next: Partial<Record<Field, string>> = {};
        (Object.keys(EMPTY) as Field[]).forEach((key) => {
            if (!form[key].trim()) next[key] = t('fieldRequired');
        });
        if (form.email.trim() && !EMAIL.test(form.email.trim())) next.email = t('invalidEmail');
        if (form.phone.trim() && !isEgyptianMobile(form.phone)) next.phone = t('invalidPhone');
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isPending || !validate()) return;
        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: normalizeEgyptianPhone(form.phone),
            message: form.message.trim(),
        };
        mutate(payload, {
            onSuccess: () => {
                setSubmitted(true);
                setForm(EMPTY);
            },
        });
    };

    const errorMessage = isError && error instanceof Error ? error.message : null;

    return (
        <div className="container">
            {/* Breadcrumb */}
            <nav className="mb-2 flex flex-wrap items-center gap-1 font-beatrice text-[12px] text-gray-500">
                <Link href="/" className="transition-colors hover:text-black">
                    {tc('home')}
                </Link>
                <span>/</span>
                <span className="text-black">{t('contact')}</span>
            </nav>

            {/* Section label */}
            <h2 className="mb-4 font-beatrice text-[20px] font-bold uppercase text-black">
                {t('contact')}
            </h2>

            <div className="relative">
                {/* Social icons */}
                <SocialLinks
                    socials={socials}
                    className="mb-6 flex items-center gap-4 md:absolute md:end-0 md:top-0 md:mb-0 md:flex-col md:gap-5"
                />

                {/* Headline */}
                <h1 className="mb-8 max-w-5xl font-beatrice text-[30px] font-extrabold leading-[1.1] text-black sm:text-[38px] lg:mb-10 lg:text-[48px]">
                    {t('contactHeadline')}
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:gap-6 lg:gap-10">
                    {errorMessage && (
                        <div className="border border-red-200 bg-red-50 px-4 py-3 font-cairo text-sm text-red-600">
                            {errorMessage}
                        </div>
                    )}
                    {submitted && (
                        <div className="border border-green-200 bg-green-50 px-4 py-3 font-cairo text-sm text-green-700">
                            {t('contactSuccess')}
                        </div>
                    )}
                    {/* Row 1 */}
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <input
                                type="text"
                                name="firstName"
                                placeholder={tc('firstName')}
                                value={form.firstName}
                                onChange={handleChange}
                                aria-invalid={!!errors.firstName}
                                className={`w-full border px-4 py-3 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none sm:py-4 rtl:text-right ${errors.firstName ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.firstName && <p className="mt-1 font-beatrice text-[12px] text-red-500">{errors.firstName}</p>}
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                name="lastName"
                                placeholder={tc('lastName')}
                                value={form.lastName}
                                onChange={handleChange}
                                aria-invalid={!!errors.lastName}
                                className={`w-full border px-4 py-3 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none sm:py-4 rtl:text-right ${errors.lastName ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.lastName && <p className="mt-1 font-beatrice text-[12px] text-red-500">{errors.lastName}</p>}
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <input
                                type="email"
                                name="email" dir="ltr"
                                placeholder={tc('email')}
                                value={form.email}
                                onChange={handleChange}
                                aria-invalid={!!errors.email}
                                className={`w-full border px-4 py-3 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none sm:py-4 rtl:text-right ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.email && <p className="mt-1 font-beatrice text-[12px] text-red-500">{errors.email}</p>}
                        </div>
                        <div className="flex-1">
                            <input
                                type="tel"
                                name="phone" dir="ltr"
                                placeholder={tc('phone')}
                                value={form.phone}
                                onChange={handleChange}
                                aria-invalid={!!errors.phone}
                                className={`w-full border px-4 py-3 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none sm:py-4 rtl:text-right ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors.phone && <p className="mt-1 font-beatrice text-[12px] text-red-500">{errors.phone}</p>}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <textarea
                            name="message"
                            placeholder={t('message')}
                            rows={6}
                            value={form.message}
                            onChange={handleChange}
                            aria-invalid={!!errors.message}
                            className={`min-h-[180px] w-full resize-none border px-4 py-3 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none sm:py-4 ${errors.message ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errors.message && <p className="mt-1 font-beatrice text-[12px] text-red-500">{errors.message}</p>}
                    </div>

                    {/* Submit */}
                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex w-full items-center justify-between gap-4 bg-black px-5 py-3 font-beatrice text-[16px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 sm:px-6 sm:text-[18px] md:w-auto md:min-w-[475px] md:py-2 md:text-[20px]"
                        >
                            <span>{isPending ? t('sending') : t('leaveMessage')}</span>
                            <svg
                                width="37"
                                height="14"
                                viewBox="0 0 37 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="shrink-0 rtl:rotate-180"
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

                {(contacts || branches.length > 0) && (
                    <div className="mt-12 grid grid-cols-1 gap-8 border-t border-gray-200 pt-10 md:grid-cols-2">
                        {contacts && (
                            <div>
                                <h2 className="mb-4 font-beatrice text-[18px] font-bold text-black">{t('reachUs')}</h2>
                                <ContactList contacts={contacts} className="flex flex-col gap-3 font-beatrice text-[15px] text-black" />
                            </div>
                        )}
                        {branches.length > 0 && (
                            <div>
                                <h2 className="mb-4 font-beatrice text-[18px] font-bold text-black">{t('ourBranches')}</h2>
                                <ul className="flex flex-col gap-3 font-beatrice text-[15px]">
                                    {branches.map(branch => (
                                        <li key={branch.id} className="flex items-start gap-2">
                                            <MapPin size={16} className="mt-1 shrink-0" aria-hidden />
                                            <div>
                                                <Link href="/branches" className="font-semibold text-black hover:underline">{branch.name}</Link>
                                                {branch.address && <p className="text-[13px] text-gray-500">{branch.address}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}