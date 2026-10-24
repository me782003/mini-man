'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import StoreProvider from './StoreProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthModalProvider } from '@/lib/context/AuthModalContext';
import AuthModal from '@/components/Auth/AuthModal';
import { Toaster } from 'sonner';
import { settingsKey, type SettingsData } from '@/lib/hooks/useSettings';

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  /** Fetched by the [locale] layout on the server; null if the API was unreachable. */
  settings: SettingsData | null;
}

export default function Providers({ children, locale, settings }: ProvidersProps) {
  // Seed the settings cache before the first render so the header/footer don't flash.
  useState(() => {
    if (settings) queryClient.setQueryData(settingsKey(locale), { data: settings });
  });

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <AuthModalProvider>
            {children}
            <AuthModal />
            <Toaster position="bottom-right" richColors closeButton />
          </AuthModalProvider>
        </StoreProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
