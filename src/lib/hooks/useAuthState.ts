'use client';

import { useEffect, useState } from 'react';
import type { AuthUser } from './useAuth';

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return { user, isLoggedIn: !!user, logout };
}
