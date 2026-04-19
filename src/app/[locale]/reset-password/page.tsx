import { Suspense } from 'react';
import ResetPasswordClient from '@/components/Auth/ResetPasswordClient';

export default function ResetPasswordPage() {
  return (
    <main>
      <Suspense>
        <ResetPasswordClient />
      </Suspense>
    </main>
  );
}
