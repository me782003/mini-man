import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import Header from '../../components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getSettings } from '@/lib/api/settings';
import { DEFAULT_SITE_NAME } from '@/lib/hooks/useSettings';

// Page titles render as "{page title} | {site name}"; the description comes from the store settings.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings(await getLocale());
  const name = settings?.site_info?.name || DEFAULT_SITE_NAME;
  return {
    title: { template: `%s | ${name}`, default: name },
    description: settings?.site_info?.description || undefined,
  };
}

export default async function LocaleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  // Same cached request as generateMetadata — Next dedupes it.
  const [messages, settings] = await Promise.all([getMessages(), getSettings(locale)]);

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers locale={locale} settings={settings}>
        <Header />
        <div className="">
          {children}
        </div>
        <Footer />
        <WhatsAppButton />
      </Providers>
    </NextIntlClientProvider>
  );
}
