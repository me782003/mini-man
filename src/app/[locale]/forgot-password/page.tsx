import { Suspense } from 'react';
import ForgotPasswordClient from '@/components/Auth/ForgotPasswordClient';

export default function ForgotPasswordPage() {
  return (
    <main>
      <Suspense>
        <ForgotPasswordClient />
      </Suspense>
    </main>
  );
}
