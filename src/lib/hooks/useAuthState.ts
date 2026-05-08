'use client';

import { useEffect, useState } from 'react';
import type { AuthUser } from './useAuth';
import { useDispatch } from 'react-redux';
import { clearProfile } from '@/lib/store/features/profileSlice';

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(clearProfile());
    setUser(null);
    window.location.href = '/login';
  };

  return { user, isLoggedIn: !!user, logout };
}
