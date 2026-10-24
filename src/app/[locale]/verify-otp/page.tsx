import { Suspense } from 'react';
import VerifyOtpClient from '@/components/Auth/VerifyOtpClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Seo');
    return privatePage(t('verifyOtp'));
}

export default function VerifyOtpPage() {
  return (
    <main>
      <Suspense>
        <VerifyOtpClient />
      </Suspense>
    </main>
  );
}
