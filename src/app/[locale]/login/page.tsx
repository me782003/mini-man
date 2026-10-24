import LoginClient from '@/components/Auth/LoginClient';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { privatePage } from '@/lib/seo';

// Personal page: titled, but kept out of search results.
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Seo');
    return privatePage(t('login'));
}

export default function LoginPage() {
  return (
    <main>
      <LoginClient />
    </main>
  );
}
