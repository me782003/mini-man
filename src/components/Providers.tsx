'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import StoreProvider from './StoreProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthModalProvider } from '@/lib/context/AuthModalContext';
import AuthModal from '@/components/Auth/AuthModal';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
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
