import type {Metadata} from 'next';
import {getLocale} from 'next-intl/server';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
      suppressHydrationWarning className={cn("font-sans", geist.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
