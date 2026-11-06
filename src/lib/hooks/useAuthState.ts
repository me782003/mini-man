'use client';

import { useDispatch, useSelector } from 'react-redux';
import { clearProfile } from '@/lib/store/features/profileSlice';
import { RootState } from '@/lib/store/store';
import { clearSession, currentLocale } from '@/lib/auth-session';

export function useAuthState() {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);

  const logout = () => {
    clearSession();
    dispatch(clearProfile());
    // Keep the language: a bare "/login" lets the middleware fall back to English.
    window.location.href = `/${currentLocale()}/login`;
  };

  return { user: profile.id ? profile : null, isLoggedIn: !!profile.id, logout };
}
