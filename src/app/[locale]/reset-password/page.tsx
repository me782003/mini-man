import { Suspense } from 'react';
import ResetPasswordClient from '@/components/Auth/ResetPasswordClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Seo');
    return privatePage(t('resetPassword'));
}

export default function ResetPasswordPage() {
  return (
    <main>
      <Suspense>
        <ResetPasswordClient />
      </Suspense>
    </main>
  );
}
