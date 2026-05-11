"use client";

import React, { useState } from 'react';
import ProductCard from '../ProductCard';
import type { HomeCollection } from '@/lib/hooks/useHomePage';

const INITIAL_VISIBLE = 4;
const LOAD_MORE_COUNT = 4;

interface HomeProductsSectionProps {
  collections?: HomeCollection[];
}

function CollectionSection({ collection }: { collection: HomeCollection }) {
  const [activeCatIdx, setActiveCatIdx] = useState(0);
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
    <section className="bg-white py-10 md:py-20">
      <div className="container px-4">
        <h2 className="mb-10 font-beatrice text-[32px] font-extrabold uppercase leading-tight md:text-[48px] md:leading-[50px]">
          {collection.title.toUpperCase()}
        </h2>

        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-[#DFDFDF] pb-2 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-5 md:gap-8 font-beatrice text-[16px] uppercase text-gray-400">
            {categories.map((cat, idx) => (
              <button
                key={cat.id ?? `all-${idx}`}
                type="button"
                onClick={() => handleCatChange(idx)}
                className={`transition-colors ${activeCatIdx === idx ? 'text-black' : 'hover:text-black'}`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((product) => (
              <ProductCard key={product.id} {...(product as any)} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="font-beatrice text-[18px] text-gray-500">No products found.</p>
          </div>
        )}

        {products.length > INITIAL_VISIBLE && (
          <button
            type="button"
            onClick={() => hasMore ? setVisibleCount((p) => p + LOAD_MORE_COUNT) : setVisibleCount(INITIAL_VISIBLE)}
            className="group mx-auto mt-16 flex flex-col items-center"
          >
            <span className="mb-2 font-beatrice text-sm uppercase text-gray-400 transition-colors group-hover:text-black">
              {hasMore ? 'More' : 'Less'}
            </span>
            <div className={`text-gray-400 transition-all group-hover:text-black ${hasMore ? 'group-hover:translate-y-1' : 'rotate-180 group-hover:-translate-y-1'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </section>
  );
}

function CollectionSkeleton() {
  return (
    <section className="bg-white py-10 md:py-20">
      <div className="container px-4">
        <div className="mb-10 h-12 w-64 animate-pulse rounded bg-gray-100" />
        <div className="mb-10 flex gap-6 border-b border-[#DFDFDF] pb-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-5 w-16 animate-pulse rounded bg-gray-100" />)}
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
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
