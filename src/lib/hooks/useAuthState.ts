'use client';

import { useDispatch, useSelector } from 'react-redux';
import { clearProfile } from '@/lib/store/features/profileSlice';
import { RootState } from '@/lib/store/store';

export function useAuthState() {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
    dispatch(clearProfile());
    window.location.href = '/login';
  };

  return { user: profile.id ? profile : null, isLoggedIn: !!profile.id, logout };
}
