'use client';

import { useLocale } from 'next-intl';

export default function LanguageSwitch({ className }: { className?: string }) {
  const locale = useLocale();

  const nextLocale = locale === 'ar' ? 'en' : 'ar';

  // Full page reload so every page, cached API response and the <html dir> start fresh in the new language.
  const switchLocale = () => {
    const { pathname, search, hash } = window.location;
    const barePath = pathname.replace(/^\/(en|ar)(?=\/|$)/, '') || '/';
    const nextPath = barePath === '/' ? `/${nextLocale}` : `/${nextLocale}${barePath}`;
    window.location.assign(`${nextPath}${search}${hash}`);
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      className={`text-xl   font-cairo tracking-wide ${className}`}
      aria-label={`Switch language to ${nextLocale.toUpperCase()}`}
    >
      {nextLocale.toUpperCase()}
    </button>
  );
}
