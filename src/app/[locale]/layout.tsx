import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '../../components/Header';
import Footer from '@/components/Footer';
import SaleTicker from '@/components/SaleTicker';
import TopCategories from '@/components/TopCategories';

export default async function LocaleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SaleTicker />
      <Header />
      {/* mobile only */}
      <TopCategories />
      {children}
      {/* <Footer /> */}
    </NextIntlClientProvider>
  );
}

