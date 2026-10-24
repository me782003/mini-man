'use client';

import React, { useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import ProductCard from '../ProductCard';
import { SearchIcon } from '../icons';
import { ArrowUpDown, ChevronDownIcon, SlidersHorizontal } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCatalogProductsInfinite, type CatalogProduct } from '@/lib/hooks/useCatalog';
import ActiveFilters from './ActiveFilters';
import { intlLocale } from '@/lib/intl';

const PER_PAGE = 12;

// Sorts the API supports (sort_by: price | created_at | stock | id; sort_order: ASC | DESC).
const SORT_OPTIONS = [
  { value: 'newest', labelKey: 'sortNewest', sort_by: 'created_at', sort_order: 'DESC' },
  { value: 'oldest', labelKey: 'sortOldest', sort_by: 'created_at', sort_order: 'ASC' },
  { value: 'price_asc', labelKey: 'sortPriceAsc', sort_by: 'price', sort_order: 'ASC' },
  { value: 'price_desc', labelKey: 'sortPriceDesc', sort_by: 'price', sort_order: 'DESC' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

function sortFromParams(params: URLSearchParams): SortValue {
  const by = params.get('sort_by') ?? 'created_at';
  const order = (params.get('sort_order') ?? 'DESC').toUpperCase();
  return SORT_OPTIONS.find((o) => o.sort_by === by && o.sort_order === order)?.value ?? 'newest';
}

function toProductCardProps(p: CatalogProduct, formatPrice: (amount: number) => string) {
  return {
    id: p.id,
    title: p.name,
    slug: p.slug,
    href: `/products/${p.slug || p.id}`,
    category: p.category_collection.category.name,
    price: formatPrice(parseFloat(p.price)),
    colorVariants: p.colors.map((c) => ({
      color: c.hexa,
      // Each colour's own photos; fall back to the whole gallery only when it has none.
      images: c.images?.length ? c.images : p.images.map((img) => img.image_path),
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
  const t = useTranslations('Products');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const n = (v: number) => v.toLocaleString(intlLocale(locale));
  const formatPrice = (amount: number) => tc('currency', { amount: amount.toLocaleString(intlLocale(locale)) });
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

  const sort = sortFromParams(searchParams);
  const listCount = (key: string) => (searchParams.get(key) ?? '').split(',').filter(Boolean).length;
  const activeFilterCount =
    listCount('collection_id') + listCount('category_id') + listCount('sub_category_id') + listCount('size_name') +
    (searchParams.get('is_available') === '0' ? 1 : 0) +
    (searchParams.get('min_price') || searchParams.get('max_price') ? 1 : 0);

  function handleSortChange(value: SortValue) {
    const option = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
    const params = new URLSearchParams(searchParams.toString());
    // Newest is the API default — keep the URL clean for it.
    if (option.value === 'newest') {
      params.delete('sort_by');
      params.delete('sort_order');
    } else {
      params.set('sort_by', option.sort_by);
      params.set('sort_order', option.sort_order);
    }
    params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const query = {
    per_page: PER_PAGE,
    search: searchParams.get('search') || undefined,
    category_id: searchParams.get('category_id') ?? undefined,
    sub_category_id: searchParams.get('sub_category_id') ?? undefined,
    collection_id: searchParams.get('collection_id') ?? undefined,
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
      {/* Search + (mobile) filters button */}
      <div className="mb-4 flex items-stretch gap-2 md:mb-8">
        <div className="relative w-full max-w-[367px]">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full border border-gray-300 py-3 ps-4 pe-12 font-beatrice text-[15px] placeholder:text-gray-400 focus:border-black focus:outline-none"
          />
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-500">
            <SearchIcon />
          </span>
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-label={activeFilterCount > 0 ? `${t('filters')} (${activeFilterCount})` : t('filters')}
          title={t('filters')}
          className="relative flex w-[50px] shrink-0 items-center justify-center border border-gray-300 text-black transition-colors hover:border-black md:hidden"
        >
          <SlidersHorizontal size={20} aria-hidden />
          {activeFilterCount > 0 && (
            <span
              aria-hidden
              className="absolute -end-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-black px-1 font-beatrice text-[11px] font-bold leading-none tabular-nums text-white ring-2 ring-white"
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <ActiveFilters />

      {/* Count + sort */}
      {/* One line on phones too: short count at the start, compact sort at the end. */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate font-cairo text-[12px] text-neutral-400 md:text-sm md:text-neutral-500">
          {!isPending && total > 0 ? (
            <>
              <span className="md:hidden">{t('showingShort', { shown: n(allProducts.length), total: n(total) })}</span>
              <span className="hidden md:inline">{t('showing', { shown: allProducts.length, total })}</span>
            </>
          ) : null}
        </p>

        <label className="flex shrink-0 items-center gap-2 font-beatrice text-[13px] text-neutral-500">
          {/* Label read by screen readers everywhere; shown from tablet up. */}
          <span className="sr-only whitespace-nowrap md:not-sr-only">{t('sortBy')}</span>
          <span className="relative">
            <ArrowUpDown size={14} aria-hidden className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-gray-500 md:hidden" />
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortValue)}
              className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-2 pe-8 ps-7 font-beatrice text-[13px] font-medium text-black transition-colors hover:border-black focus:border-black focus:outline-none md:pe-9 md:ps-3"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
              ))}
            </select>
            <ChevronDownIcon size={16} className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-500 md:end-3" />
          </span>
        </label>
      </div>

      {/* Error */}
      {isError && (
        <p className="py-24 text-center font-beatrice text-[16px] text-red-400">
          {t('loadError')}
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
              <ProductCard key={product.id} {...toProductCardProps(product, formatPrice)} />
            ))}
            {isFetchingNextPage &&
              Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)
            }
          </div>

          {hasNextPage && (
            <>
              {/* Same style as the home sections' "Show more": grey, borderless, black when active. */}
              <div className="mt-8 flex justify-center md:mt-12">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  aria-busy={isFetchingNextPage}
                  className="group inline-flex items-center gap-2 bg-gray-100 px-7 py-3 font-beatrice text-[14px] font-semibold uppercase tracking-wide text-gray-700 transition-colors hover:bg-black hover:text-white active:bg-black active:text-white disabled:pointer-events-none disabled:opacity-60"
                >
                  {isFetchingNextPage ? (
                    <>
                      <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                      {tc('loading')}
                    </>
                  ) : (
                    <>
                      {t('seeMore')}
                      <ChevronDownIcon size={16} strokeWidth={2.5} aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {!isPending && !isError && allProducts.length === 0 && (
        <p className="py-24 text-center font-beatrice text-[16px] text-gray-400">
          {t('noProducts')}
        </p>
      )}
    </div>
  );
}
