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
import { useCatalogCategories } from '@/lib/hooks/useCatalog';
import { useSettings } from '@/lib/hooks/useSettings';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';

export default function Header() {
  const t = useTranslations('Header');
  const ts = useTranslations('Site');
  const [isFixed, setIsFixed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(null);
  const { data: categoriesData } = useCatalogCategories();
  const categories = categoriesData?.data ?? [];
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const height = entries[0].target.getBoundingClientRect().height;
        setHeaderHeight(height);
        // Lets sticky elements (e.g. the filters sidebar) sit just below the fixed header.
        document.documentElement.style.setProperty('--header-h', `${height}px`);
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

  useLockBodyScroll(isMobileMenuOpen);

  const toggleSection = (id: number) => {
    setOpenSection(prev => (prev === id ? null : id));
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
  const { data: settingsResponse } = useSettings();
  // Hide branch links once we know there are none (keep them while settings load).
  const hasBranches = !settingsResponse || (settingsResponse.data.branches?.length ?? 0) > 0;
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

        <div className="container py-[0px] md:py-[20px]">
          {/* Mobile Header */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`flex h-10 me-5 items-center justify-center text-neutral-900`}
              aria-label={ts('openMenu')}
            >
              <MenuIcon className="" />
            </button>

            <Link href="/" className="flex flex-1">
              <span className="relative h-[34px] w-[107px]">
                <Image
                  src='/images/logo.svg'
                  alt={ts('logoAlt')}
                  fill
                  className="h-full w-full object-contain"
                  priority
                />
              </span>
            </Link>

            <div className="flex items-center gap-[10px] text-neutral-900">
              <Link
                href="/favorites"
                className="grid place-items-center rounded"
                aria-label={ts('favorites')}
              >
                <HeartIcon className="h-[24px] w-[24px]" />
              </Link>

              <Link
                href="/cart"
                className="relative grid place-items-center rounded"
                aria-label={cartCount > 0 ? `${ts('cart')} (${cartCount})` : ts('cart')}
              >
                <BagIcon className="h-[24px] w-[24px]" />
                <CartBadge count={cartCount} />
              </Link>

              <LanguageSwitch className="!text-neutral-900 !font-bold" />
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
                    alt={ts('logoAlt')}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="h-full w-full object-contain"
                  />
                </span>
              </Link>
            </div>

            <nav className="hidden items-center justify-center gap-7 md:flex">
              {(['/', '/products', '/branches', '/contact'] as const).map((href, i) => {
                if (href === '/branches' && !hasBranches) return null;
                const labels = [t('home'), t('orderNow'), t('branches'), t('contact')];
                // Current page keeps the underline; others grow it in on hover / keyboard focus.
                const barePath = pathname.replace(/^\/(en|ar)(?=\/|$)/, '') || '/';
                const active = href === '/' ? barePath === '/' : barePath === href || barePath.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative py-1 font-beatrice text-[18px] uppercase leading-[100%] tracking-[0em] transition-colors
                      after:absolute after:-bottom-0.5 after:start-0 after:h-[2px] after:w-full after:rounded-full after:bg-current after:content-['']
                      after:origin-left rtl:after:origin-right after:transition-transform after:duration-300 after:ease-out
                      hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none
                      ${active ? 'after:scale-x-100' : 'after:scale-x-0'}
                      ${isHome && !isFixed ? 'text-white hover:text-white' : 'text-neutral-800 hover:text-neutral-950'}`}
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
                    <div className="absolute end-0 top-full mt-2 w-52 bg-white shadow-lg border border-neutral-100 z-50">
                      {[
                        { href: '/account', label: ts('myAccount') },
                        { href: '/account/orders', label: ts('orders') },
                        { href: '/account/addresses', label: ts('addresses') },
                        { href: '/favorites', label: ts('wishlist') },
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
                          {ts('logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`grid h-8 w-8 place-items-center rounded transition-all ${isHome && !isFixed ? 'text-white hover:text-white/70' : 'text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200'}`}
                  aria-label={ts('login')}
                >
                  <UserIcon className="h-[32px] w-[32px]" />
                </Link>
              )}

              <Link
                href="/favorites"
                className={`${"grid h-8 w-8 place-items-center rounded  transition-all"} ${isHome && !isFixed ? 'text-white hover:text-white/70' : 'text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200'}`}
                aria-label={ts('favorites')}
              >
                <HeartIcon className="h-[32px] w-[32px]" />
              </Link>

              <Link
                href="/cart"
                className={`relative ${"grid h-8 w-8 place-items-center rounded  transition-all"} ${isHome && !isFixed ? 'text-white hover:text-white/70' : 'text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200'}`}
                aria-label={cartCount > 0 ? `${ts('cart')} (${cartCount})` : ts('cart')}
              >
                <BagIcon className="h-[32px] w-[32px]" />
                <CartBadge count={cartCount} />
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
          className={`absolute start-0 top-0 h-full w-[82%] max-w-[320px] overflow-y-auto bg-[#efefef]  shadow-xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
            }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-0 p-5 sticky top-0 bg-[#efefef] flex items-center justify-between">
            <span className="font-beatrice text-[24px] font-bold text-neutral-900">
              {ts('menu')}
            </span>

            <button
              type="button"
              onClick={closeMobileMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-200"
              aria-label={ts('closeMenu')}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className='p-5'>
            {/* Account first: profile, account links, logout / login */}
            <div className="mb-6 border-b border-neutral-300 pb-6">
              {isLoggedIn ? (
                <>
                  {/* Profile row toggles the account pages below */}
                  <button
                    type="button"
                    onClick={() => setIsMobileAccountOpen(v => !v)}
                    aria-expanded={isMobileAccountOpen}
                    aria-controls="mobile-account-links"
                    className="flex w-full items-center gap-3 rounded-lg text-start"
                  >
                    {profile.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt={profile.name}
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-200 font-beatrice text-sm font-bold text-neutral-700">
                        {profile.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-beatrice text-[16px] font-bold text-neutral-900">{profile.name}</p>
                      <p className="truncate font-cairo text-[13px] text-neutral-500">{profile.email}</p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-neutral-200">
                      <ChevronDown
                        aria-hidden
                        className={`h-5 w-5 text-neutral-700 transition-transform duration-200 ${isMobileAccountOpen ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${isMobileAccountOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                  <div className="overflow-hidden">
                  <nav id="mobile-account-links" className="flex flex-col gap-1 pt-3" inert={!isMobileAccountOpen}>
                    {[
                      { href: '/account', label: ts('myAccount') },
                      { href: '/account/orders', label: ts('orders') },
                      { href: '/account/addresses', label: ts('addresses') },
                      { href: '/favorites', label: ts('wishlist') },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={closeMobileMenu}
                        className="rounded-lg px-3 py-2.5 font-cairo text-[15px] text-neutral-700 hover:bg-neutral-200"
                      >
                        {label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => { closeMobileMenu(); logout(); }}
                      className="mt-1 rounded-lg px-3 py-2.5 text-start font-cairo text-[15px] text-red-500 hover:bg-red-50"
                    >
                      {ts('logout')}
                    </button>
                  </nav>
                  </div>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 font-beatrice text-[18px] uppercase text-neutral-900"
                >
                  <UserIcon className="h-[24px] w-[24px]" />
                  {ts('login')}
                </Link>
              )}
            </div>


            {/* Main links */}
            <nav className="flex flex-col gap-4">
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
              {hasBranches && (
                <Link
                  href="/branches"
                  onClick={closeMobileMenu}
                  className="font-beatrice text-[18px] uppercase text-neutral-900"
                >
                  {t('branches')}
                </Link>
              )}
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="font-beatrice text-[18px] uppercase text-neutral-900"
              >
                {t('contact')}
              </Link>
            </nav>

            {/* Expandable category menu */}
            {categories.length > 0 && (
            <nav className="mt-6 flex flex-col divide-y divide-neutral-300 border-t border-neutral-300">
              {categories.map(category => (
                <div key={category.id}>
                  <button
                    type="button"
                    onClick={() => toggleSection(category.id)}
                    aria-expanded={openSection === category.id}
                    className="flex w-full items-center justify-between gap-3 py-3.5 text-start"
                  >
                    <span className="font-beatrice text-[15px] font-semibold text-black">
                      {category.name}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-neutral-600 transition-transform duration-200 ${openSection === category.id ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${openSection === category.id
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-3 pb-4 ps-3">
                        <Link
                          href={`/products?category_id=${category.id}`}
                          onClick={closeMobileMenu}
                          className="font-beatrice text-[14px] font-medium text-black underline underline-offset-2"
                        >
                          {ts('viewAllIn', { name: category.name })}
                        </Link>
                        {category.subCategories.map(sub => (
                          <Link
                            key={sub.id}
                            href={`/products?category_id=${category.id}&sub_category_id=${sub.id}`}
                            onClick={closeMobileMenu}
                            className="font-beatrice text-[14px] text-neutral-600 hover:text-black"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </nav>
            )}



          </div>
        </div>
      </div>
    </>
  );
}

/** Item count pinned to the cart icon's top corner (flips side in RTL). */
function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -end-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#D62D2D] px-1 font-beatrice text-[11px] font-bold leading-none tabular-nums text-white shadow-sm ring-2 ring-white"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
