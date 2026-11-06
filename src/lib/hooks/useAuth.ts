import { useMutation } from '@tanstack/react-query';
import { post } from '@/lib/fetcher';
import { phonePayload } from '@/lib/countries';

// Every request with a phone sends it as { phone, phone_code } (see phonePayload).
const withPhone = <T extends { phone: string }>(payload: T) => ({ ...payload, ...phonePayload(payload.phone) });

export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  /** True when the account has no verified phone yet (Google sign-ups). */
  needs_phone?: boolean;
  name: string;
  phone: string;
  email: string;
  is_verified: number;
  profile_picture: string | null;
}

export interface AuthResponse {
  data: {
    token: string;
    user: AuthUser;
    smsSent?: boolean;
  };
  message: string;
  error: string;
  errors: string[];
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      post<AuthResponse>('/user/auth/register', withPhone(payload)),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      post<AuthResponse>('/user/auth/login', withPhone(payload)),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) =>
      post<AuthResponse>('/user/auth/verify-otp', withPhone(payload)),
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (phone: string) =>
      post('/user/auth/resend-otp', phonePayload(phone)),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (phone: string) =>
      post<{ data: object; message: string; error: string }>('/user/auth/forgot-password', phonePayload(phone)),
  });
}

export interface ResetPasswordPayload {
  phone: string;
  otp: string;
  newPassword: string;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      post<{ data: object; message: string; error: string }>('/user/auth/reset-password', withPhone(payload)),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      post<{ data: object; message: string; error: string }>('/user/auth/change-password', payload),
  });
}

export interface GoogleAuthPayload {
  google_id: string;
  email: string;
  name: string;
  picture: string;
}

export function useGoogleAuth() {
  return useMutation({
    mutationFn: (payload: GoogleAuthPayload) =>
      post<AuthResponse>('/user/auth/google', payload),
  });
}

/* ─── Adding a phone to an account (Google sign-ups) ─────────────────── */

/** Saves the number and sends a 4-digit code on WhatsApp. Calling it again resends the code. */
export function useAddPhone() {
  return useMutation({
    mutationFn: (phone: string) => post<{ data: unknown; message: string }>('/user/auth/phone', phonePayload(phone)),
  });
}

/** Confirms the code; `data` is the updated profile (needs_phone: false). */
export function useVerifyPhone() {
  return useMutation({
    mutationFn: (otp: string) => post<{ data: AuthUser; message: string }>('/user/auth/phone/verify', { otp }),
  });
}
