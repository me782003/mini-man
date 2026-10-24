import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import HomeClient from "@/components/Home/HomeClient";
import { getSettings } from '@/lib/api/settings';
import { DEFAULT_SITE_NAME } from '@/lib/hooks/useSettings';
import { SITE_URL, localizedAlternates } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { alternates: localizedAlternates(locale) };
}

export default async function HomePage() {
  const locale = await getLocale();
  const settings = await getSettings(locale);
  // Lets search engines show a search box for the store (searches go to the products page).
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings?.site_info?.name || DEFAULT_SITE_NAME,
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/${locale}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website).replace(/</g, '\\u003c') }} />
      <HomeClient />
    </>
  );
}
