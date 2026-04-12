import type {Metadata} from 'next';
import {getLocale} from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shoes Store',
  description: 'Shoes store'
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
