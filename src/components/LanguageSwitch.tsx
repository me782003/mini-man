'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '../i18n/navigation';

export default function LanguageSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = locale === 'ar' ? 'en' : 'ar';

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, {locale: nextLocale})}
      className="text-xl font-bold  font-cairo tracking-wide text-neutral-800 hover:text-neutral-950"
      aria-label={`Switch language to ${nextLocale.toUpperCase()}`}
    >
      {nextLocale.toUpperCase()}
    </button>
  );
}

