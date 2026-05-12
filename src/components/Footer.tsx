'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSettings } from '@/lib/hooks/useSettings';
import { FooterFacebookIcon, FooterInstagramIcon, FooterTikTokIcon, FooterThreadsIcon, FooterYouTubeIcon } from './icons';

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: FooterFacebookIcon,
  instagram: FooterInstagramIcon,
  tiktok: FooterTikTokIcon,
  threads: FooterThreadsIcon,
  youtube: FooterYouTubeIcon,
};

export default function Footer() {
  const { data } = useSettings();
  const settings = data?.data;

  const footerLogo = settings?.site_info?.footer_logo;
  const contacts = settings?.contacts;
  const socials = contacts?.socials ?? [];
  const emails = contacts?.emails ?? [];
  const phones = contacts?.phone ?? [];
  const staticPages = settings?.static_pages ?? [];

  return (
    <footer className="w-full bg-1">

      {/* ── Mobile layout (hidden on lg+) ── */}
      <div className="lg:hidden container px-4 pt-10 pb-6 flex flex-col gap-8">

        {/* Follow Us */}
        {socials.length > 0 && (
          <div className="flex flex-col items-center gap-4">
            <p className="font-beatrice text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Follow Us
            </p>
            <div className="flex items-center gap-5">
              {socials.map((s) => {
                const Icon = PLATFORM_ICONS[s.platform.toLowerCase()];
                return Icon ? (
                  <a key={s.platform} href={s.value} target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                    <Icon className="h-6 w-6" />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Shop */}
        <div>
          <p className="mb-4 font-beatrice text-[15px] font-bold uppercase text-black">
            Shop
          </p>
          <div className="flex flex-col gap-4 font-beatrice text-[14px] uppercase text-black">
            <Link href="/products">Men</Link>
            <Link href="/products">Women</Link>
            <Link href="/products">Kids</Link>
            <Link href="/products">Accessories</Link>
          </div>
        </div>

        {/* Help */}
        <div>
          <p className="mb-4 font-beatrice text-[15px] font-bold uppercase text-black">
            Help
          </p>
          <div className="flex flex-col gap-4 font-beatrice text-[14px] uppercase text-black">
            <Link href="/contact">Contact</Link>
            {staticPages.map((page) => (
              <Link key={page.id} href={`/pages/${page.slug}`}>{page.title}</Link>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center pt-2">
          <div className="relative h-[80px] w-[180px]">
            {/* {footerLogo ? (
              <Image src={footerLogo} alt="Logo" fill className="object-contain" unoptimized />
            ) : ( */}
            <Link href="/">
              <Image src="/images/logo.svg" alt="Logo" fill className="object-contain" />
            </Link>
            {/* )} */}
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="flex flex-col items-center gap-3 border-t border-gray-300 pt-4">
          <p className="font-beatrice text-[14px] text-black">
            © {new Date().getFullYear()} {settings?.site_info?.name ?? 'Miniman'} Rights Reserved.
          </p>
        </div>
      </div>

      {/* ── Desktop layout (hidden below lg) ── */}
      <div className="mx-auto hidden lg:flex items-start container justify-between py-16">
        <div className="flex flex-col items-start gap-5 font-beatrice">
          <Link href="/" className="text-[18px] font-normal uppercase text-black">
            Home
          </Link>
          <Link href="/branches" className="text-[18px] font-normal uppercase text-black">
            Our Branches
          </Link>
          <Link href="/contact" className="text-[18px] font-normal uppercase text-black">
            Contact Us
          </Link>
          {staticPages.map((page) => (
            <Link key={page.id} href={`/pages/${page.slug}`} className="text-[18px] font-normal uppercase text-black">
              {page.title}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-center">
          <div className="relative h-[120px] w-[260px] md:h-[140px] md:w-[300px]">
            {/* {footerLogo ? (
              <Image src={footerLogo} alt="Miniman Logo" fill className="object-contain" unoptimized />
            ) : ( */}
            <Link href="/">
              <Image src="/images/logo.png" alt="Miniman Logo" fill className="object-contain" />
            </Link>
            {/* )} */}
          </div>
        </div>

        <div className="flex flex-col items-start gap-4">
          {emails.length > 0 && (
            <a href={`mailto:${emails[0].value}`} className="text-[18px] uppercase text-black">
              {emails[0].value}
            </a>
          )}

          {phones.length > 0 && (
            <div className="flex flex-col gap-1 text-[18px] uppercase text-black">
              {phones.map((p, i) => (
                <a key={i} href={`tel:${p.value}`}>{p.value}</a>
              ))}
            </div>
          )}

          {socials.length > 0 && (
            <div className="flex items-center gap-4 pt-2">
              {socials.map((s) => {
                const Icon = PLATFORM_ICONS[s.platform.toLowerCase()];
                return Icon ? (
                  <a key={s.platform} href={s.value} target="_blank" rel="noopener noreferrer" aria-label={s.platform}>
                    <Icon className="h-5 w-5" />
                  </a>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
