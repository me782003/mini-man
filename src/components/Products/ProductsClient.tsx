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
        <nav className="mb-4 flex items-center gap-1.5 font-beatrice text-[14px] text-gray-500">
          <Link href="/" className="hover:text-black transition-colors">{tc('home')}</Link>
          <span>/</span>
          <span className="text-black">{t('title')}</span>
        </nav>

        {/* Heading */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-beatrice text-[32px] font-bold uppercase tracking-widest text-black">{t('title')}</h1>
        </div>

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
