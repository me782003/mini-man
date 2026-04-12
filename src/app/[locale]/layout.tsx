import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '../../components/Header';
import Footer from '@/components/Footer';

export default async function LocaleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header />
      {children}
      <Footer />
    </NextIntlClientProvider>
  );
}

