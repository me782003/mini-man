import { Suspense } from 'react';
import VerifyOtpClient from '@/components/Auth/VerifyOtpClient';

export default function VerifyOtpPage() {
  return (
    <main>
      <Suspense>
        <VerifyOtpClient />
      </Suspense>
    </main>
  );
}
