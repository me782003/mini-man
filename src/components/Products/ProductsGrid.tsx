'use client';

import React, { useRef, useState } from 'react';
import ProductCard from '../ProductCard';
import { SearchIcon } from '../icons';
import { ChevronDownIcon, ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCatalogProductsInfinite, type CatalogProduct } from '@/lib/hooks/useCatalog';

const PER_PAGE = 12;

function toProductCardProps(p: CatalogProduct) {
  return {
    title: p.name,
    category: p.category_collection.category.name,
    price: `${parseFloat(p.price).toLocaleString()} EGP`,
    colorVariants: p.colors.map((c) => ({
      color: c.hexa,
      images: c.image ? [c.image] : p.images.map((img) => img.image_path),
    })),
  };
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full bg-neutral-200" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-1/3 rounded bg-neutral-200" />
        <div className="h-4 w-2/3 rounded bg-neutral-200" />
        <div className="h-4 w-1/4 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

export default function ProductsGrid({ setFiltersOpen }: { setFiltersOpen: (v: boolean) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(val: string) {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (val.trim()) params.set('search', val.trim());
      else params.delete('search');
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    }, 400);
  }

  const query = {
    per_page: PER_PAGE,
    search: searchParams.get('search') || undefined,
    category_id: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined,
    sub_category_id: searchParams.get('sub_category_id') ? Number(searchParams.get('sub_category_id')) : undefined,
    collection_id: searchParams.get('collection_id') ? Number(searchParams.get('collection_id')) : undefined,
    size_name: searchParams.get('size_name') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    is_available: searchParams.get('is_available') != null && searchParams.get('is_available') !== ''
      ? Number(searchParams.get('is_available'))
      : undefined,
    sort_by: searchParams.get('sort_by') || undefined,
    sort_order: searchParams.get('sort_order') || undefined,
  };

  const {
    data,
    isPending,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCatalogProductsInfinite(query);

  const allProducts = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.pagination.total ?? 0;

  return (
    <div className="flex-1 min-w-0">
      {/* Search */}
      <div className="relative mb-4 md:mb-8 max-w-[367px]">
        <input
          type="text"
          placeholder="Search"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full border border-gray-300 py-3 pl-4 pr-12 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
          <SearchIcon />
        </span>
      </div>

      {/* Mobile filter toggle */}
      <button
        className="mb-5 flex items-center gap-2 font-beatrice text-[13px] font-semibold uppercase tracking-widest transition-colors hover:border-black md:hidden"
        onClick={() => setFiltersOpen(true)}
      >
        Filters <ChevronRight size={20} />
      </button>

      {/* Count */}
      {!isPending && total > 0 && (
        <p className="mb-4 font-cairo text-sm text-neutral-500">
          Showing {allProducts.length} of {total} product{total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Error */}
      {isError && (
        <p className="py-24 text-center font-beatrice text-[16px] text-red-400">
          Failed to load products. Please try again.
        </p>
      )}

      {/* Initial skeleton */}
      {isPending && (
        <div className="grid grid-cols-2 gap-x-[10px] gap-y-5 md:gap-x-6 md:gap-y-10 xl:grid-cols-3">
          {Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Grid */}
      {allProducts.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-x-[10px] gap-y-5 md:gap-x-6 md:gap-y-10 xl:grid-cols-3">
            {allProducts.map((product) => (
              <ProductCard key={product.id} {...toProductCardProps(product)} />
            ))}
            {isFetchingNextPage &&
              Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)
            }
          </div>

          {hasNextPage && (
            <>
              <div className="mt-10 h-px w-full bg-neutral-200" />
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="flex flex-col items-center gap-1 px-12 py-3.5 font-beatrice text-[13px] font-semibold uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50"
                >
                  {isFetchingNextPage ? 'Loading…' : 'See More'}
                  {!isFetchingNextPage && <ChevronDownIcon size={16} />}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {!isPending && !isError && allProducts.length === 0 && (
        <p className="py-24 text-center font-beatrice text-[16px] text-gray-400">
          No products found.
        </p>
      )}
    </div>
  );
}
