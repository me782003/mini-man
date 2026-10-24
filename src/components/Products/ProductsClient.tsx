'use client';

import { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import FiltersSidebar from './FiltersSidebar';
import ProductsGrid from './ProductsGrid';

function ProductsContent() {
  const t = useTranslations('Products');
  const tc = useTranslations('Common');
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex gap-12 items-start">
      <FiltersSidebar isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} />

      <div className="flex-1 min-w-0">
        {/* Breadcrumb */}
        <nav className="mb-2 flex items-center gap-1 font-beatrice text-[12px] text-gray-500">
          <Link href="/" className="hover:text-black transition-colors">{tc('home')}</Link>
          <span>/</span>
          <span aria-current="page" className="font-semibold text-black">{t('title')}</span>
        </nav>

        {/* Heading */}
        {/* Same title style as the other pages (cart, checkout, account…). */}
        <h1 className="mb-6 font-beatrice text-[20px] font-bold uppercase text-black md:mb-8">{t('title')}</h1>

        <ProductsGrid setFiltersOpen={setFiltersOpen} />
      </div>
    </div>
  );
}

export default function ProductsClient() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
