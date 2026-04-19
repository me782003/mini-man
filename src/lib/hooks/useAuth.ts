import { useMutation } from '@tanstack/react-query';
import { post } from '@/lib/fetcher';

export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
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
      post<AuthResponse>('/user/auth/register', payload),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      post<AuthResponse>('/user/auth/login', payload),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) =>
      post<AuthResponse>('/user/auth/verify-otp', payload),
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (phone: string) =>
      post('/user/auth/resend-otp', { phone }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (phone: string) =>
      post<{ data: object; message: string; error: string }>('/user/auth/forgot-password', { phone }),
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
      post<{ data: object; message: string; error: string }>('/user/auth/reset-password', payload),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      post<{ data: object; message: string; error: string }>('/user/auth/change-password', payload),
  });
}
