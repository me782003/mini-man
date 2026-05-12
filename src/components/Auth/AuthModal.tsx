'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { GoogleLogin } from '@react-oauth/google';
import { X } from 'lucide-react';
import { useLogin, useRegister, useGoogleAuth } from '@/lib/hooks/useAuth';
import { setProfile } from '@/lib/store/features/profileSlice';
import { useAuthModal } from '@/lib/context/AuthModalContext';
import { toast } from 'sonner';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block font-beatrice text-[12px] font-medium uppercase tracking-wide text-neutral-700">{label}</label>
      {children}
      {error && <p className="font-cairo text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = (hasError: boolean) =>
  `h-[46px] w-full border px-4 font-cairo text-[14px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-700 ${hasError ? 'border-red-400 bg-red-50' : 'border-neutral-300 bg-white'}`;

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { mutate: login, isPending, isError, error } = useLogin();
  const { mutate: googleAuth } = useGoogleAuth();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  };

  const saveAuth = (token: string, user: object) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    dispatch(setProfile(user as Parameters<typeof setProfile>[0]));
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    toast.success('Signed in successfully');
    onSuccess();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<Record<keyof typeof form, string>> = {};
    if (!form.phone.trim()) errors.phone = 'Required';
    if (!form.password.trim()) errors.password = 'Required';
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    login(form, { onSuccess: (res) => saveAuth(res.data.token, res.data.user) });
  };

  const errorMessage = isError && error instanceof Error ? error.message : null;

  return (
    <div className="space-y-4">
      <GoogleLogin
        text="continue_with"
        onSuccess={(cred) => {
          const token = cred.credential;
          if (!token) return;
          const { sub, email, name, picture } = JSON.parse(atob(token.split('.')[1]));
          googleAuth(
            { google_id: sub, email, name, picture },
            { onSuccess: (res) => saveAuth(res.data.token, res.data.user) }
          );
        }}
        onError={() => {}}
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 border-b border-neutral-200" />
        <span className="font-cairo text-xs text-neutral-400">OR</span>
        <div className="flex-1 border-b border-neutral-200" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {errorMessage && (
          <p className="border border-red-200 bg-red-50 px-3 py-2 font-cairo text-xs text-red-600">{errorMessage}</p>
        )}
        <Field label="Phone" error={fieldErrors.phone}>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange}
            placeholder="201234567890" autoComplete="tel" className={inputCls(!!fieldErrors.phone)} />
        </Field>
        <Field label="Password" error={fieldErrors.password}>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
              onChange={handleChange} placeholder="Your password" autoComplete="current-password"
              className={`${inputCls(!!fieldErrors.password)} pr-10`} />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-700">
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </Field>
        <button type="submit" disabled={isPending}
          className="w-full bg-neutral-900 py-3 font-headline text-[14px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-neutral-700 disabled:opacity-60">
          {isPending ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { mutate: register, isPending, isError, error } = useRegister();
  const { mutate: googleAuth } = useGoogleAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  };

  const saveAuth = (token: string, user: object) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    dispatch(setProfile(user as Parameters<typeof setProfile>[0]));
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    toast.success('Signed in successfully');
    onSuccess();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim()) errors.name = 'Required';
    if (!/^01[0-9]{9}$/.test(form.phone)) errors.phone = 'Valid Egyptian phone required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Valid email required';
    if (form.password.length < 8) errors.password = 'Min 8 characters';
    if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    const { confirmPassword: _, ...payload } = form;
    register(payload, { onSuccess: (res) => saveAuth(res.data.token, res.data.user) });
  };

  const errorMessage = isError && error instanceof Error ? error.message : null;

  return (
    <div className="space-y-4">
      <GoogleLogin
        text="continue_with"
        onSuccess={(cred) => {
          const token = cred.credential;
          if (!token) return;
          const { sub, email, name, picture } = JSON.parse(atob(token.split('.')[1]));
          googleAuth(
            { google_id: sub, email, name, picture },
            { onSuccess: (res) => saveAuth(res.data.token, res.data.user) }
          );
        }}
        onError={() => {}}
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 border-b border-neutral-200" />
        <span className="font-cairo text-xs text-neutral-400">OR</span>
        <div className="flex-1 border-b border-neutral-200" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {errorMessage && (
          <p className="border border-red-200 bg-red-50 px-3 py-2 font-cairo text-xs text-red-600">{errorMessage}</p>
        )}
        <Field label="Full Name" error={fieldErrors.name}>
          <input type="text" name="name" value={form.name} onChange={handleChange}
            placeholder="John Doe" autoComplete="name" className={inputCls(!!fieldErrors.name)} />
        </Field>
        <Field label="Phone" error={fieldErrors.phone}>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange}
            placeholder="01234567890" autoComplete="tel" className={inputCls(!!fieldErrors.phone)} />
        </Field>
        <Field label="Email" error={fieldErrors.email}>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="you@example.com" autoComplete="email" className={inputCls(!!fieldErrors.email)} />
        </Field>
        <Field label="Password" error={fieldErrors.password}>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
              onChange={handleChange} placeholder="Min 8 characters" autoComplete="new-password"
              className={`${inputCls(!!fieldErrors.password)} pr-10`} />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-700">
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </Field>
        <Field label="Confirm Password" error={fieldErrors.confirmPassword}>
          <input type="password" name="confirmPassword" value={form.confirmPassword}
            onChange={handleChange} placeholder="Repeat password" autoComplete="new-password"
            className={inputCls(!!fieldErrors.confirmPassword)} />
        </Field>
        <button type="submit" disabled={isPending}
          className="w-full bg-neutral-900 py-3 font-headline text-[14px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-neutral-700 disabled:opacity-60">
          {isPending ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

export default function AuthModal() {
  const { isOpen, closeAuthModal, consumePendingAction } = useAuthModal();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={closeAuthModal}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-neutral-400 transition-colors hover:text-neutral-900"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="mb-1 font-headline text-[24px] font-bold uppercase tracking-tight text-neutral-900">
          {tab === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="mb-5 font-cairo text-sm text-neutral-500">
          {tab === 'login' ? 'Sign in to save items and manage your cart' : 'Join us to start shopping'}
        </p>

        {/* Tabs */}
        <div className="mb-5 flex border-b border-neutral-200">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`pb-2 pr-5 font-beatrice text-[13px] font-semibold uppercase tracking-wide transition-colors ${tab === 'login' ? 'border-b-2 border-neutral-900 text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`pb-2 pr-5 font-beatrice text-[13px] font-semibold uppercase tracking-wide transition-colors ${tab === 'register' ? 'border-b-2 border-neutral-900 text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'}`}
          >
            Register
          </button>
        </div>

        {tab === 'login' ? (
          <LoginForm onSuccess={consumePendingAction} />
        ) : (
          <RegisterForm onSuccess={consumePendingAction} />
        )}
      </div>
    </div>
  );
}
