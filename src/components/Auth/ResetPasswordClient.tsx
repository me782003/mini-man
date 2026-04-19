'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResetPassword } from '@/lib/hooks/useAuth';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';
  const otp   = searchParams.get('otp')   ?? '';

  const { mutate: resetPassword, isPending, isError, error, isSuccess } = useResetPassword();

  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [fieldErrors, setFieldErrors]         = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (newPassword.length < 8)            errors.newPassword     = 'Password must be at least 8 characters';
    if (confirmPassword !== newPassword)   errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    resetPassword({ phone, otp, newPassword }, {
      onSuccess: () => {
        setTimeout(() => router.push('/login'), 1500);
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>

        <div className="mb-10 text-center">
          <h1 className="font-headline text-[32px] font-bold uppercase tracking-tight text-neutral-900">
            Reset Password
          </h1>
          <p className="mt-2 font-cairo text-sm text-neutral-500">
            Choose a strong new password for your account
          </p>
        </div>

        {isSuccess ? (
          <div className="border border-green-200 bg-green-50 px-5 py-5 text-center font-cairo text-sm text-green-700">
            <p className="text-base font-semibold">Password reset successfully!</p>
            <p className="mt-1 text-neutral-500">Redirecting to login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {errorMessage && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 font-cairo text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block font-beatrice text-[13px] font-medium uppercase tracking-wide text-neutral-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setFieldErrors((f) => ({ ...f, newPassword: undefined })); }}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={`h-[50px] w-full border px-4 pr-12 font-cairo text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700 ${fieldErrors.newPassword ? 'border-red-400 bg-red-50' : 'border-neutral-300 bg-white'}`}
                />
                <button type="button" onClick={() => setShowNew((v) => !v)}
                  className="absolute inset-y-0 right-4 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors">
                  <EyeIcon open={showNew} />
                </button>
              </div>
              {fieldErrors.newPassword && <p className="font-cairo text-xs text-red-500">{fieldErrors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block font-beatrice text-[13px] font-medium uppercase tracking-wide text-neutral-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((f) => ({ ...f, confirmPassword: undefined })); }}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`h-[50px] w-full border px-4 pr-12 font-cairo text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700 ${fieldErrors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-neutral-300 bg-white'}`}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-4 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="font-cairo text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit" disabled={isPending}
              className="flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-headline text-[16px] font-semibold uppercase text-white transition-colors hover:bg-neutral-700 disabled:opacity-60"
            >
              <span>{isPending ? 'Resetting…' : 'Reset Password'}</span>
              <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
                <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        )}

        <p className="mt-8 text-center font-cairo text-sm text-neutral-500">
          <Link href="/login" className="font-semibold text-neutral-900 underline underline-offset-2 hover:opacity-70">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
