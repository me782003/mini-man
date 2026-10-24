import RegisterClient from '@/components/Auth/RegisterClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Seo');
    return privatePage(t('register'));
}

export default function RegisterPage() {
  return (
    <main>
      <RegisterClient />
    </main>
  );
}
