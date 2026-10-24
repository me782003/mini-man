"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '../ProductCard';
import type { HomeCollection } from '@/lib/hooks/useHomePage';
import { useScrollFade } from '@/lib/hooks/useScrollFade';

const INITIAL_VISIBLE = 4;
const LOAD_MORE_COUNT = 4;

interface HomeProductsSectionProps {
  collections?: HomeCollection[];
}

function CollectionSection({ collection }: { collection: HomeCollection }) {
  const t = useTranslations('Home');
  const [activeCatIdx, setActiveCatIdx] = useState(0);
  const [tabsRef, tabsFade] = useScrollFade<HTMLDivElement>();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const categories = collection.categories;
  const activeCategory = categories[activeCatIdx];
  const products = activeCategory?.products ?? [];
  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleCatChange = (idx: number) => {
    setActiveCatIdx(idx);
    setVisibleCount(INITIAL_VISIBLE);
  };

  return (
    <section className="bg-white py-6 md:py-20">
      <div className="container px-4">
        <h2 className="mb-4 font-beatrice text-[26px] font-extrabold uppercase leading-tight md:mb-10 md:text-[48px] md:leading-[50px]">
          {collection.title.toUpperCase()}
        </h2>

        <div className="mb-5 flex flex-col justify-between gap-6 border-b border-[#DFDFDF] pb-2 md:mb-10 md:flex-row md:items-center">
          {/* One swipeable line; edges fade where more categories are hidden. */}
          <div
            ref={tabsRef}
            style={tabsFade}
            role="tablist"
            className="no-scrollbar -mx-4 overflow-x-auto overscroll-x-contain px-4 md:mx-0 md:px-0"
          >
            <div className="flex w-max items-center gap-5 font-beatrice text-[16px] uppercase text-gray-400 md:gap-8">
            {categories.map((cat, idx) => (
              <button
                key={cat.id ?? `all-${idx}`}
                type="button"
                role="tab"
                aria-selected={activeCatIdx === idx}
                onClick={(e) => {
                  handleCatChange(idx);
                  // Bring the chosen tab into view (centred) when part of it is off-screen.
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`shrink-0 whitespace-nowrap py-1 transition-colors ${activeCatIdx === idx ? 'text-black' : 'hover:text-black'}`}
              >
                {cat.title}
              </button>
            ))}
            </div>
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
            {visible.map((product) => (
              <ProductCard key={product.id} {...(product as any)} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="font-beatrice text-[18px] text-gray-500">{t('noProducts')}</p>
          </div>
        )}

        {products.length > INITIAL_VISIBLE && (
          <div className="mt-8 flex justify-center md:mt-14">
            <button
              type="button"
              onClick={() => hasMore ? setVisibleCount((p) => p + LOAD_MORE_COUNT) : setVisibleCount(INITIAL_VISIBLE)}
              className="group inline-flex items-center gap-2 bg-gray-100 px-7 py-3 font-beatrice text-[14px] font-semibold uppercase tracking-wide text-gray-700 transition-colors hover:bg-black hover:text-white active:bg-black active:text-white"
            >
              {hasMore ? t('showMore') : t('showLess')}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className={`transition-transform duration-200 ${hasMore ? 'group-hover:translate-y-0.5' : 'rotate-180 group-hover:-translate-y-0.5'}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function CollectionSkeleton() {
  return (
    <section className="bg-white py-6 md:py-20">
      <div className="container px-4">
        <div className="mb-10 h-12 w-64 animate-pulse rounded bg-gray-100" />
        <div className="mb-10 flex gap-6 border-b border-[#DFDFDF] pb-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-5 w-16 animate-pulse rounded bg-gray-100" />)}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
          {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-[3/4] animate-pulse rounded bg-gray-100" />)}
        </div>
      </div>
    </section>
  );
}

export default function HomeProductsSection({ collections }: HomeProductsSectionProps) {
  if (!collections) return <CollectionSkeleton />;
  if (collections.length === 0) return null;

  return (
    <>
      {collections.map((col) => (
        <CollectionSection key={col.collection_id} collection={col} />
      ))}
    </>
  );
}
