import { Suspense } from 'react';
import ForgotPasswordClient from '@/components/Auth/ForgotPasswordClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Seo');
    return privatePage(t('forgotPassword'));
}

export default function ForgotPasswordPage() {
  return (
    <main>
      <Suspense>
        <ForgotPasswordClient />
      </Suspense>
    </main>
  );
}
