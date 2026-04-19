'use client';

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyOtp, useResendOtp } from '@/lib/hooks/useAuth';

const OTP_LENGTH = 4;

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';
  const mode  = searchParams.get('mode') ?? 'verify'; // 'verify' | 'reset'

  const { mutate: verify, isPending, isError, error } = useVerifyOtp();
  const { mutate: resend, isPending: isResending, isSuccess: resendSuccess } = useResendOtp();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0 || !phone) return;
    resend(phone, { onSuccess: () => setCooldown(60) });
  };

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) return;
    if (mode === 'reset') {
      router.push(`/reset-password?phone=${encodeURIComponent(phone)}&otp=${encodeURIComponent(otp)}`);
      return;
    }

    verify({ phone, otp }, {
      onSuccess: (res) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.push('/account');
      },
    });
  };

  const errorMessage = isError && error instanceof Error ? error.message : null;
  const isFilled = digits.every((d) => d !== '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-16">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6.29 6.29l1.94-1.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
        </div>

        <h1 className="font-headline text-[32px] font-bold uppercase tracking-tight text-neutral-900">
          Verify Your Account
        </h1>
        <p className="mt-2 mb-10 font-cairo text-sm text-neutral-500">
          Enter the {OTP_LENGTH}-digit code sent to{' '}
          <span className="font-semibold text-neutral-700">{phone}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {errorMessage && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 font-cairo text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {/* OTP inputs */}
          <div className="flex justify-center gap-3">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className={`h-16 w-14 border-2 text-center font-headline text-[28px] font-bold text-neutral-900 outline-none transition-all ${
                  digit
                    ? 'border-neutral-900 bg-white'
                    : 'border-neutral-300 bg-white focus:border-neutral-700'
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isPending || !isFilled}
            className="flex w-full items-center justify-between bg-neutral-900 px-5 py-4 font-headline text-[16px] font-semibold uppercase text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
          >
            <span>{isPending ? 'Verifying…' : 'Verify Account'}</span>
            <svg width="30" height="12" viewBox="0 0 37 14" fill="none">
              <path d="M1 7H35.5M35.5 7L29.5 1M35.5 7L29.5 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Resend */}
          <div className="text-center font-cairo text-sm text-neutral-500">
            {resendSuccess && cooldown > 0 && (
              <p className="mb-1 text-green-600">Code sent! Check your phone.</p>
            )}
            Didn&apos;t receive a code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="font-semibold text-neutral-900 underline underline-offset-2 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isResending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
