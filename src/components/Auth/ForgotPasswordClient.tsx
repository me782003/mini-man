'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForgotPassword } from '@/lib/hooks/useAuth';

export default function ForgotPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: forgotPassword, isPending, isError, error, isSuccess } = useForgotPassword();

  const [phone, setPhone] = useState(searchParams.get('phone') ?? '');
  const [phoneError, setPhoneError] = useState('');

  const validate = () => {
    if (!phone.trim()) return 'Phone number is required';
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setPhoneError(err); return; }

    forgotPassword(phone, {
      onSuccess: () => {
        router.push(`/verify-otp?phone=${encodeURIComponent(phone)}&mode=reset`);
      },
    });
  };

  const errorMessage = isError && error instanceof Error ? error.message : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-16">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <div className="mb-10 text-center">
          <h1 className="font-headline text-[32px] font-bold uppercase tracking-tight text-neutral-900">
            Forgot Password
          </h1>
          <p className="mt-2 font-cairo text-sm text-neutral-500">
            Enter your phone number and we'll send you a reset code
          </p>
        </div>

        {isSuccess ? (
          <div className="border border-green-200 bg-green-50 px-5 py-4 text-center font-cairo text-sm text-green-700">
            ✓ Reset code sent successfully. Redirecting…
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {errorMessage && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 font-cairo text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-beatrice text-[13px] font-medium uppercase tracking-wide text-neutral-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
                placeholder="201234567890"
                autoComplete="tel"
                className={`h-[50px] w-full border px-4 font-cairo text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700 ${
                  phoneError ? 'border-red-400 bg-red-50' : 'border-neutral-300 bg-white'
                }`}
              />
              {phoneError && <p className="font-cairo text-xs text-red-500">{phoneError}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-headline text-[16px] font-semibold uppercase text-white transition-colors hover:bg-neutral-700 disabled:opacity-60"
            >
              <span>{isPending ? 'Sending…' : 'Send Reset Code'}</span>
              <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
                <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        )}

        <p className="mt-8 text-center font-cairo text-sm text-neutral-500">
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-neutral-900 underline underline-offset-2 hover:opacity-70">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
