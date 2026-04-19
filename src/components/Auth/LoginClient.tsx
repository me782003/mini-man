'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/lib/hooks/useAuth';

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

export default function LoginClient() {
  const router = useRouter();
  const { mutate: login, isPending, isError, error } = useLogin();

  const [form, setForm] = useState({ phone: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errors: Partial<Record<keyof typeof form, string>> = {};
    if (!form.phone.trim())    errors.phone    = 'Phone number is required';
    if (!form.password.trim()) errors.password = 'Password is required';
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    login(form, {
      onSuccess: (res) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.push('/account');
      },
    });
  };

  const errorMessage = isError && error instanceof Error ? error.message : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-headline text-[36px] font-bold uppercase tracking-tight text-neutral-900">
            Welcome Back
          </h1>
          <p className="mt-2 font-cairo text-sm text-neutral-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {errorMessage && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 font-cairo text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {/* Phone */}
          <Field label="Phone Number" error={fieldErrors.phone}>
            <input
              type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="201234567890" autoComplete="tel"
              className={inputCls(!!fieldErrors.phone)}
            />
          </Field>

          {/* Password */}
          <Field label="Password" error={fieldErrors.password}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password" value={form.password} onChange={handleChange}
                placeholder="Your password" autoComplete="current-password"
                className={`${inputCls(!!fieldErrors.password)} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-4 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </Field>

          <div className="flex justify-end">
            <Link href={`/forgot-password${form.phone ? `?phone=${encodeURIComponent(form.phone)}` : ''}`} className="font-cairo text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-800">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit" disabled={isPending}
            className="flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-headline text-[16px] font-semibold uppercase text-white transition-colors hover:bg-neutral-700 disabled:opacity-60"
          >
            <span>{isPending ? 'Signing in…' : 'Sign In'}</span>
            <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
              <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>

        <p className="mt-8 text-center font-cairo text-sm text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-neutral-900 underline underline-offset-2 hover:opacity-70">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-beatrice text-[13px] font-medium uppercase tracking-wide text-neutral-700">
        {label}
      </label>
      {children}
      {error && <p className="font-cairo text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `h-[50px] w-full border px-4 font-cairo text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700 ${
    hasError ? 'border-red-400 bg-red-50' : 'border-neutral-300 bg-white'
  }`;
}
