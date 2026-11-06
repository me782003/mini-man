'use client';

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import PhoneInput from '@/components/Country/PhoneInput';
import { isValidPhone } from '@/lib/countries';
import { ApiError } from '@/lib/fetcher';
import { useAddPhone, useVerifyPhone } from '@/lib/hooks/useAuth';
import { localRedirectPath } from '@/lib/auth-session';

export const PHONE_PROMPT_SKIPPED_KEY = 'phone_prompt_skipped';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

/**
 * "Add your phone number" for accounts with needs_phone (Google sign-ups):
 * 1. POST /user/auth/phone sends a 4-digit code on WhatsApp; 2. POST /user/auth/phone/verify confirms it.
 * Once verified the number is read-only.
 */
export default function CompletePhoneClient() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const redirectTo = localRedirectPath(searchParams.get('redirect'), '/account');
    // Opened from the checkout (server asked for a verified phone): no "later".
    const required = searchParams.get('required') === '1';

    const addPhone = useAddPhone();
    const verifyPhone = useVerifyPhone();
    const [step, setStep] = useState<'phone' | 'code'>('phone');
    const [phone, setPhone] = useState('');
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const apiMessage = (err: unknown) =>
        err instanceof ApiError && err.status === 409 ? t('phoneTaken') : err instanceof Error && err.message ? err.message : t('somethingWrong');

    const sendCode = (onSent?: () => void) => {
        setError(null);
        addPhone.mutate(phone, {
            onSuccess: () => { setCooldown(RESEND_SECONDS); onSent?.(); },
            onError: (err) => setError(apiMessage(err)),
        });
    };

    const submitPhone = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidPhone(phone)) { setError(t('phoneInvalidAny')); return; }
        sendCode(() => {
            setDigits(Array(OTP_LENGTH).fill(''));
            setStep('code');
            setTimeout(() => inputRefs.current[0]?.focus(), 0);
        });
    };

    const submitCode = (e: React.FormEvent) => {
        e.preventDefault();
        const otp = digits.join('');
        if (otp.length < OTP_LENGTH) return;
        setError(null);
        verifyPhone.mutate(otp, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                router.replace(redirectTo);
            },
            onError: (err) => setError(apiMessage(err)),
        });
    };

    const setDigit = (idx: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        setDigits(d => { const next = [...d]; next[idx] = val; return next; });
        if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    };

    const onKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
    };

    const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        setDigits(d => { const next = [...d]; pasted.split('').forEach((ch, i) => { next[i] = ch; }); return next; });
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const skip = () => {
        try { window.sessionStorage.setItem(PHONE_PROMPT_SKIPPED_KEY, '1'); } catch { /* storage blocked */ }
        router.replace(redirectTo);
    };

    const arrow = (
        <svg width="30" height="12" viewBox="0 0 37 14" fill="none" className="rtl:rotate-180">
            <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
    const primaryBtn = 'flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-headline text-[16px] font-semibold uppercase text-white transition-colors hover:bg-neutral-700 disabled:opacity-50';

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-16">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="font-headline text-[30px] font-bold uppercase tracking-tight text-neutral-900">
                        {step === 'phone' ? t('completePhoneTitle') : t('verifyTitle')}
                    </h1>
                    <p className="mt-2 font-cairo text-sm text-neutral-500">
                        {step === 'phone'
                            ? (required ? t('completePhoneRequired') : t('completePhoneSubtitle'))
                            : <>{t('whatsappCodeSentTo', { length: OTP_LENGTH })} <span dir="ltr" className="font-semibold text-neutral-700">{phone}</span></>}
                    </p>
                </div>

                {error && (
                    <div role="alert" className="mb-5 border border-red-200 bg-red-50 px-4 py-3 font-cairo text-sm text-red-600">{error}</div>
                )}

                {step === 'phone' ? (
                    <form onSubmit={submitPhone} noValidate className="space-y-5">
                        <div>
                            <label className="mb-2 block font-cairo text-[13px] font-semibold text-neutral-700">{t('phoneNumber')}</label>
                            <PhoneInput value={phone} onChange={v => { setPhone(v); setError(null); }} invalid={!!error} />
                            <p className="mt-2 font-cairo text-[12px] text-neutral-500">{t('phoneLockedHint')}</p>
                        </div>
                        <button type="submit" disabled={addPhone.isPending} className={primaryBtn}>
                            <span>{addPhone.isPending ? t('sending') : t('sendCode')}</span>
                            {arrow}
                        </button>
                        {!required && (
                            <button type="button" onClick={skip} className="w-full font-cairo text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-800">
                                {t('later')}
                            </button>
                        )}
                    </form>
                ) : (
                    <form onSubmit={submitCode} className="space-y-8">
                        <div dir="ltr" className="flex justify-center gap-3">
                            {digits.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={el => { inputRefs.current[idx] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                                    aria-label={t('otpDigit', { n: idx + 1 })}
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => setDigit(idx, e.target.value)}
                                    onKeyDown={e => onKeyDown(idx, e)}
                                    onPaste={onPaste}
                                    className={`h-16 w-14 border-2 bg-white text-center font-headline text-[28px] font-bold text-neutral-900 outline-none transition-all ${digit ? 'border-neutral-900' : 'border-neutral-300 focus:border-neutral-700'}`}
                                />
                            ))}
                        </div>
                        <button type="submit" disabled={verifyPhone.isPending || digits.some(d => !d)} className={primaryBtn}>
                            <span>{verifyPhone.isPending ? t('verifying') : t('confirmPhone')}</span>
                            {arrow}
                        </button>
                        <div className="flex items-center justify-between font-cairo text-sm text-neutral-500">
                            <button type="button" onClick={() => { setStep('phone'); setError(null); }} className="underline underline-offset-2 hover:text-neutral-800">
                                {t('changeNumber')}
                            </button>
                            <button
                                type="button"
                                onClick={() => sendCode()}
                                disabled={cooldown > 0 || addPhone.isPending}
                                className="font-semibold text-neutral-900 underline underline-offset-2 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {addPhone.isPending ? t('sending') : cooldown > 0 ? t('resendIn', { seconds: cooldown }) : t('resendCode')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
