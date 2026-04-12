'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import LanguageSwitch from './LanguageSwitch';
import { BagIcon, HeartIcon, MenuIcon, UserIcon } from './icons';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const t = useTranslations('Header');
  const [isFixed, setIsFixed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 200);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`w-full z-50 transition-all duration-300 ${isFixed
          ? 'fixed top-0 left-0 bg-white/95 shadow-md backdrop-blur-md'
          : 'bg-transparent'
          }`}
      >
        <div className="container py-[17px] md:py-[35px]">
          {/* Mobile Header */}
          <div className="flex items-center  md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 me-5 items-center justify-center text-neutral-900"
              aria-label="Open menu"
            >
              <MenuIcon className="" />
            </button>

            <Link
              href="/"
              className="flex flex-1 "
            >
              <span className="relative h-[34px] w-[107px]">
                <Image
                  src="/images/logo.svg"
                  alt="Logo"
                  fill
                  className="h-full w-full object-contain"
                  priority
                />
              </span>
            </Link>

            <div className="flex items-center gap-[10px] text-neutral-900">
              <button
                type="button"
                className="grid  place-items-center rounded"
                aria-label="Favorites"
              >
                <HeartIcon className="h-[24px] w-[24px]" />
              </button>

              <button
                type="button"
                className="grid  place-items-center rounded"
                aria-label="Cart"
              >
                <BagIcon className="h-[24px] w-[24px]" />
              </button>

              <LanguageSwitch />
            </div>
          </div>

          {/* Desktop Header - unchanged */}
          <div className="hidden items-center justify-between gap-6 md:flex">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-semibold text-neutral-900"
              >
                <span className="relative h-[50px] w-[191px]">
                  <Image
                    src="/images/logo.svg"
                    alt="Logo"
                    fill
                    className="h-full w-full object-contain"
                    priority
                  />
                </span>
              </Link>
            </div>

            <nav className="hidden items-center justify-center gap-7 md:flex">
              <Link
                href="/"
                className="font-beatrice text-[20px] font-normal uppercase leading-[100%] tracking-[0em] text-neutral-800 hover:text-neutral-950"
              >
                {t('home')}
              </Link>
              <Link
                href="/order"
                className="font-beatrice text-[20px] font-normal uppercase leading-[100%] tracking-[0em] text-neutral-800 hover:text-neutral-950"
              >
                {t('orderNow')}
              </Link>
              <Link
                href="/branches"
                className="font-beatrice text-[20px] font-normal uppercase leading-[100%] tracking-[0em] text-neutral-800 hover:text-neutral-950"
              >
                {t('branches')}
              </Link>
              <Link
                href="/contact"
                className="font-beatrice text-[20px] font-normal uppercase leading-[100%] tracking-[0em] text-neutral-800 hover:text-neutral-950"
              >
                {t('contact')}
              </Link>
            </nav>

            <div className="flex items-center gap-4 text-neutral-900">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded hover:bg-neutral-100"
                aria-label="Account"
              >
                <UserIcon className="h-[32px] w-[32px]" />
              </button>

              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded hover:bg-neutral-100"
                aria-label="Favorites"
              >
                <HeartIcon className="h-[32px] w-[32px]" />
              </button>

              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded hover:bg-neutral-100"
                aria-label="Cart"
              >
                <BagIcon className="h-[32px] w-[32px]" />
              </button>

              <LanguageSwitch />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${isMobileMenuOpen
          ? 'pointer-events-auto bg-black/40 opacity-100'
          : 'pointer-events-none opacity-0'
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-white p-6 shadow-xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="text-lg font-semibold text-neutral-900">Menu</span>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-5">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-beatrice text-[20px] uppercase text-neutral-900"
            >
              {t('home')}
            </Link>
            <Link
              href="/order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-beatrice text-[20px] uppercase text-neutral-900"
            >
              {t('orderNow')}
            </Link>
            <Link
              href="/branches"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-beatrice text-[20px] uppercase text-neutral-900"
            >
              {t('branches')}
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-beatrice text-[20px] uppercase text-neutral-900"
            >
              {t('contact')}
            </Link>
          </nav>

          <div className="mt-10 flex items-center gap-3 border-t border-neutral-200 pt-6">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
              aria-label="Account"
            >
              <UserIcon className="h-[24px] w-[24px]" />
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
              aria-label="Favorites"
            >
              <HeartIcon className="h-[24px] w-[24px]" />
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
              aria-label="Cart"
            >
              <BagIcon className="h-[24px] w-[24px]" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}