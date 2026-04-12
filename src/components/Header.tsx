'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import LanguageSwitch from './LanguageSwitch';
import { BagIcon, HeartIcon, UserIcon } from './icons';
import { useEffect, useState } from 'react';

export default function Header() {
  const t = useTranslations('Header');
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 200);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`w-full z-50 transition-all duration-300 ${isFixed
          ? 'fixed top-0 left-0 bg-white/95 shadow-md backdrop-blur-md'
          : 'absolute top-0 left-0 bg-transparent'
        }`}
    >
      <div className="container py-[35px]">
        <div className="flex items-center justify-between gap-6">
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
  );
}