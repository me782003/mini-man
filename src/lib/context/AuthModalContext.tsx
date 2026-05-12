'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

interface AuthModalContextValue {
  isOpen: boolean;
  openAuthModal: (onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  consumePendingAction: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingRef = useRef<(() => void) | null>(null);

  const openAuthModal = useCallback((onSuccess?: () => void) => {
    pendingRef.current = onSuccess ?? null;
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    pendingRef.current = null;
    setIsOpen(false);
  }, []);

  const consumePendingAction = useCallback(() => {
    setIsOpen(false);
    const fn = pendingRef.current;
    pendingRef.current = null;
    fn?.();
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, openAuthModal, closeAuthModal, consumePendingAction }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
