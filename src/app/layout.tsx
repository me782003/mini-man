import type {Metadata} from 'next';
import {getLocale} from 'next-intl/server';
import './globals.css';
import { Cairo, Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
// Self-hosted and preloaded (a CSS @import of Google Fonts could arrive late or not at all,
// leaving Arabic text in a random system font).
const cairo = Cairo({subsets:['arabic','latin'],weight:['400','500','600','700','800','900'],variable:'--font-cairo',display:'swap'});

export const metadata: Metadata = {
  title: 'Mini Man',
  description: ''
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
      suppressHydrationWarning className={cn("font-sans", geist.variable, cairo.variable)}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
