'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSettings } from '@/lib/hooks/useSettings';
import { DEFAULT_SITE_NAME } from '@/lib/hooks/useSettings';
import SocialLinks from '@/components/Site/SocialLinks';
import ContactList from '@/components/Site/ContactList';

export default function Footer() {
  const t = useTranslations('Site');
  const tc = useTranslations('Common');
  const { data } = useSettings();
  const settings = data?.data;

  const contacts = settings?.contacts;
  const socials = contacts?.socials ?? [];
  const description = settings?.site_info?.description;
  const siteName = settings?.site_info?.name || DEFAULT_SITE_NAME;
  const staticPages = (settings?.static_pages ?? []).filter(page => page.title);
  const branches = (settings?.branches ?? []).filter(branch => branch.name);

  return (
    <footer className="w-full bg-1">

      {/* ── Mobile layout (hidden on lg+) ── */}
      <div className="lg:hidden container px-4 pt-10 pb-6 flex flex-col gap-8">

        {/* Follow Us */}
        {socials.length > 0 && (
          <div className="flex flex-col items-center gap-4">
            <p className="font-beatrice text-[11px] font-bold uppercase tracking-widest text-gray-500">
              {t('followUs')}
            </p>
            <SocialLinks socials={socials} className="flex items-center gap-5" />
          </div>
        )}

        {/* Shop */}
        <div>
          <p className="mb-4 font-beatrice text-[15px] font-bold uppercase text-black">
            {t('shop')}
          </p>
          <div className="flex flex-col gap-4 font-beatrice text-[14px] uppercase text-black">
            <Link href="/products">{t('men')}</Link>
            <Link href="/products">{t('women')}</Link>
            <Link href="/products">{t('kids')}</Link>
            <Link href="/products">{t('accessories')}</Link>
          </div>
        </div>

        {/* Help */}
        <div>
          <p className="mb-4 font-beatrice text-[15px] font-bold uppercase text-black">
            {t('help')}
          </p>
          <div className="flex flex-col gap-4 font-beatrice text-[14px] uppercase text-black">
            <Link href="/contact">{t('contact')}</Link>
            {staticPages.map((page) => (
              <Link key={page.id} href={`/pages/${page.slug}`}>{page.title}</Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <ContactList contacts={contacts} className="flex flex-col gap-3 font-beatrice text-[14px] text-black" />

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="relative h-[80px] w-[180px]">
            {/* {footerLogo ? (
              <Image src={footerLogo} alt="Logo" fill className="object-contain" unoptimized />
            ) : ( */}
            <Link href="/">
              <Image src="/images/logo.svg" alt={t('logoAlt')} fill className="object-contain" />
            </Link>
            {/* )} */}
          </div>
          {description && <p className="max-w-[320px] text-center font-beatrice text-[13px] text-gray-600">{description}</p>}
        </div>

        {/* Divider + copyright */}
        <div className="flex flex-col items-center gap-3 border-t border-gray-300 pt-4">
          <p className="font-beatrice text-[14px] text-black">
            {t('rightsReserved', { year: new Date().getFullYear(), name: siteName })}
          </p>
        </div>
      </div>

      {/* ── Desktop layout (hidden below lg) ── */}
      <div className="mx-auto hidden lg:flex items-start container justify-between py-16">
        <div className="flex flex-col items-start gap-5 font-beatrice">
          <Link href="/" className="text-[18px] font-normal uppercase text-black">
            {tc('home')}
          </Link>
          {(!data || branches.length > 0) && (
            <Link href="/branches" className="text-[18px] font-normal uppercase text-black">
              {t('ourBranches')}
            </Link>
          )}
          <Link href="/contact" className="text-[18px] font-normal uppercase text-black">
            {t('contactUs')}
          </Link>
          {staticPages.map((page) => (
            <Link key={page.id} href={`/pages/${page.slug}`} className="text-[18px] font-normal uppercase text-black">
              {page.title}
            </Link>
          ))}
          {branches.length > 0 && (
            <div className="mt-2 flex flex-col gap-1 text-[14px] text-gray-600">
              {branches.map(branch => (
                <Link key={branch.id} href="/branches" className="hover:text-black">{branch.name}</Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative h-[120px] w-[260px] md:h-[140px] md:w-[300px]">
            {/* {footerLogo ? (
              <Image src={footerLogo} alt="Miniman Logo" fill className="object-contain" unoptimized />
            ) : ( */}
            <Link href="/">
              <Image src="/images/logo.png" alt={t('logoAlt')} fill className="object-contain" />
            </Link>
            {/* )} */}
          </div>
          {description && <p className="max-w-[300px] text-center font-beatrice text-[14px] text-gray-600">{description}</p>}
          <p className="font-beatrice text-[13px] text-gray-500">
            {t('rightsReserved', { year: new Date().getFullYear(), name: siteName })}
          </p>
        </div>

        <div className="flex flex-col items-start gap-4">
          <ContactList contacts={contacts} className="flex flex-col gap-2 font-beatrice text-[16px] text-black" />
          <SocialLinks socials={socials} iconClassName="h-5 w-5" className="flex items-center gap-4 pt-2" />
        </div>
      </div>
    </footer>
  );
}
