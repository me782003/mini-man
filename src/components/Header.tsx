'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import LanguageSwitch from './LanguageSwitch';
import { BagIcon, HeartIcon, MenuIcon, UserIcon } from './icons';
import { useEffect, useState, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import TopCategories from './TopCategories';
import SaleTicker from './SaleTicker';
import { useAuthState } from '@/lib/hooks/useAuthState';
import { useProfile, useProfileData } from '@/lib/hooks/useProfile';
import { useCart } from '@/lib/hooks/useCart';

type MobileMenuSection = 'men' | 'women' | 'kids' | 'accessories' | null;

export default function Header() {
  const t = useTranslations('Header');
  const [isFixed, setIsFixed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<MobileMenuSection>('men');
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setHeaderHeight(entries[0].target.getBoundingClientRect().height);
      }
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 100);
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

  const toggleSection = (section: Exclude<MobileMenuSection, null>) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pathname = usePathname();
  const isHome = pathname === '/en' || pathname === '/ar';
  const { isLoggedIn, logout } = useAuthState();

  // Fetch and sync profile to Redux
  useProfile();
  // Get data from Redux
  const profile = useProfileData();

  const { data: cartResponse } = useCart();
  const cartCount = cartResponse?.data?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  console.log("userData", profile);


  return (
    <>
      {isFixed && (
        <div style={{ height: `${headerHeight}px` }} className={isHome ? 'md:hidden' : ''} aria-hidden="true" />
      )}
      <header
        ref={headerRef}
        className={`w-full z-50 transition-all duration-300 ${isFixed
          ? 'fixed top-0 left-0 bg-white/95 shadow-md backdrop-blur-md'
          : isHome ? "md:absolute  top-0 left-0 bg-transparent "
            : 'bg-transparent'
          }`}
      >
        <SaleTicker />

        <div className="container py-[17px] md:py-[35px]">
          {/* Mobile Header */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`flex h-10 me-5 items-center justify-center text-neutral-900`}
              aria-label="Open menu"
            >
              <MenuIcon className="" />
            </button>

            <Link href="/" className="flex flex-1">
              <span className="relative h-[34px] w-[107px]">
                <Image
                  src={isHome && !isFixed ? '/images/logo-white.png' : '/images/logo.svg'}
                  alt="Logo"
                  fill
                  className="h-full w-full object-contain"
                  priority
                />
              </span>
            </Link>

            <div className={`flex items-center gap-[10px] ${isHome && !isFixed ? 'text-white' : 'text-neutral-900'}`}>
              <Link
                href="/favorites"
                className="grid place-items-center rounded"
                aria-label="Favorites"
              >
                <HeartIcon className="h-[24px] w-[24px]" />
              </Link>

              <Link
                href="/cart"
                className="relative grid place-items-center rounded"
                aria-label="Cart"
              >
                <BagIcon className="h-[24px] w-[24px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-0.5 font-beatrice text-[10px] font-bold leading-none text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              <LanguageSwitch className={`  ${isHome && !isFixed ? "!text-white" : "!text-neutral-900"} !font-bold`} />
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
                  <img
                    src={isHome && !isFixed ? '/images/logo-white.png' : '/images/logo.svg'}
                    alt="Logo"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="h-full w-full object-contain"
                  />
                </span>
              </Link>
            </div>

            <nav className="hidden items-center justify-center gap-7 md:flex">
              {(['/', '/products', '/branches', '/contact'] as const).map((href, i) => {
                const labels = [t('home'), t('orderNow'), t('branches'), t('contact')];
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`font-beatrice text-[18px]  transition-all  uppercase leading-[100%] tracking-[0em] hover:font-bold ${isHome && !isFixed ? 'text-white hover:text-white/70' : 'text-neutral-800 hover:text-neutral-950'}`}
                  >
                    {labels[i]}
                  </Link>
                );
              })}
            </nav>

            <div className={`flex items-center gap-4 ${isHome && !isFixed ? 'text-white' : 'text-neutral-900'}`}>
              {isLoggedIn ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(v => !v)}
                    className={`flex items-center gap-2 font-cairo text-sm font-medium transition-opacity hover:opacity-70 ${isHome && !isFixed ? 'text-white' : 'text-neutral-900'}`}
                  >
                    {profile.profile_picture ? (
                      <img src={profile.profile_picture} alt={profile.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700">
                        {profile.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="hidden lg:block">{profile.name?.split(' ')[0]}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white shadow-lg border border-neutral-100 z-50">
                      {[
                        { href: '/account', label: 'My Account' },
                        { href: '/account/orders', label: 'Orders' },
                        { href: '/account/addresses', label: 'Addresses' },
                        { href: '/favorites', label: 'Wishlist' },
                      ].map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="block px-4 py-3 font-cairo text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                        >
                          {label}
                        </Link>
                      ))}
                      <div className="border-t border-neutral-100">
                        <button
                          onClick={() => { setIsProfileDropdownOpen(false); logout(); }}
                          className="flex w-full items-center gap-2 px-4 py-3 font-cairo text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`grid h-8 w-8 place-items-center rounded transition-all ${isHome && !isFixed ? 'text-white hover:text-white/70' : 'text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200'}`}
                  aria-label="Login"
                >
                  <UserIcon className="h-[32px] w-[32px]" />
                </Link>
              )}

              <Link
                href="/favorites"
                className={`${"grid h-8 w-8 place-items-center rounded  transition-all"} ${isHome && !isFixed ? 'text-white hover:text-white/70' : 'text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200'}`}
                aria-label="Favorites"
              >
                <HeartIcon className="h-[32px] w-[32px]" />
              </Link>

              <Link
                href="/cart"
                className={`relative ${"grid h-8 w-8 place-items-center rounded  transition-all"} ${isHome && !isFixed ? 'text-white hover:text-white/70' : 'text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200'}`}
                aria-label="Cart"
              >
                <BagIcon className="h-[32px] w-[32px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-[23px] flex h-[25px] min-w-[25px] items-center justify-center rounded-full bg-black px-0.5 font-beatrice text-[10px] font-bold leading-none text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              <LanguageSwitch className='!font-bold' />
            </div>
          </div>
        </div>
        <TopCategories />
      </header>


      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${isMobileMenuOpen
          ? 'pointer-events-auto bg-black/40 opacity-100'
          : 'pointer-events-none opacity-0'
          }`}
        onClick={closeMobileMenu}
      >
        <div
          className={`absolute left-0 top-0 h-full w-[82%] max-w-[320px] overflow-y-auto bg-[#efefef]  shadow-xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-0 p-5 sticky top-0 bg-[#efefef] flex items-center justify-between">
            <span className="font-beatrice text-[24px] font-bold text-neutral-900">
              Menu
            </span>

            <button
              type="button"
              onClick={closeMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-200"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className='p-5'>


            {/* Expandable category menu */}
            <nav className="flex flex-col">
              <div className="pb-1">
                <button
                  type="button"
                  onClick={() => toggleSection('men')}
                  className="flex w-full items-center justify-between py-3 text-left"
                >
                  <span className="font-beatrice text-[20px] font-bold text-black">
                    Men
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-black transition-transform duration-200 ${openSection === 'men' ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ${openSection === 'men'
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-6 px-4 pb-4 pt-1">
                      <Link
                        href="/men/items-by-miniman"
                        onClick={closeMobileMenu}
                        className="font-beatrice text-[16px] text-black"
                      >
                        Items By MiniMan
                      </Link>
                      <Link
                        href="/men/mirror"
                        onClick={closeMobileMenu}
                        className="font-beatrice text-[16px] text-black"
                      >
                        Mirror
                      </Link>
                      <Link
                        href="/men/classic"
                        onClick={closeMobileMenu}
                        className="font-beatrice text-[16px] text-black"
                      >
                        Classic
                      </Link>
                      <Link
                        href="/men/big-size"
                        onClick={closeMobileMenu}
                        className="font-beatrice text-[16px] text-black"
                      >
                        Big Size
                      </Link>
                      <Link
                        href="/men/slippers"
                        onClick={closeMobileMenu}
                        className="font-beatrice text-[16px] text-black"
                      >
                        Slippers
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pb-1">
                <button
                  type="button"
                  onClick={() => toggleSection('women')}
                  className="flex w-full items-center justify-between py-3 text-left"
                >
                  <span className="font-beatrice text-[20px] font-bold text-black">
                    Women
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-black transition-transform duration-200 ${openSection === 'women' ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ${openSection === 'women'
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-6 px-4 pb-4 pt-1">
                      <Link
                        href="/women"
                        onClick={closeMobileMenu}
                        className="font-beatrice text-[16px] text-black"
                      >
                        View All Women
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pb-1">
                <button
                  type="button"
                  onClick={() => toggleSection('kids')}
                  className="flex w-full items-center justify-between py-3 text-left"
                >
                  <span className="font-beatrice text-[20px] font-bold text-black">
                    Kids
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-black transition-transform duration-200 ${openSection === 'kids' ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ${openSection === 'kids'
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-6 px-4 pb-4 pt-1">
                      <Link
                        href="/kids"
                        onClick={closeMobileMenu}
                        className="font-beatrice text-[16px] text-black"
                      >
                        View All Kids
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pb-1">
                <button
                  type="button"
                  onClick={() => toggleSection('accessories')}
                  className="flex w-full items-center justify-between py-3 text-left"
                >
                  <span className="font-beatrice text-[20px] font-bold text-black">
                    Accessories
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-black transition-transform duration-200 ${openSection === 'accessories' ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ${openSection === 'accessories'
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-6 px-4 pb-4 pt-1">
                      <Link
                        href="/accessories"
                        onClick={closeMobileMenu}
                        className="font-beatrice text-[16px] text-black"
                      >
                        View All Accessories
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Old navigations */}
            <nav className="mb-7 flex flex-col gap-4 border-t border-neutral-300 pt-6">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="font-beatrice text-[18px] uppercase text-neutral-900"
              >
                {t('home')}
              </Link>
              <Link
                href="/products"
                onClick={closeMobileMenu}
                className="font-beatrice text-[18px] uppercase text-neutral-900"
              >
                {t('orderNow')}
              </Link>
              <Link
                href="/branches"
                onClick={closeMobileMenu}
                className="font-beatrice text-[18px] uppercase text-neutral-900"
              >
                {t('branches')}
              </Link>
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="font-beatrice text-[18px] uppercase text-neutral-900"
              >
                {t('contact')}
              </Link>
            </nav>

            <div className="mt-8 flex items-center gap-3 border-t border-neutral-300 pt-6">
              <Link
                href="/account"
                onClick={closeMobileMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-200"
                aria-label="Account"
              >
                <UserIcon className="h-[24px] w-[24px]" />
              </Link>

              <Link
                href="/favorites"
                onClick={closeMobileMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-200"
                aria-label="Favorites"
              >
                <HeartIcon className="h-[24px] w-[24px]" />
              </Link>

              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-200"
                aria-label="Cart"
              >
                <BagIcon className="h-[24px] w-[24px]" />
                {cartCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-0.5 font-beatrice text-[10px] font-bold leading-none text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}