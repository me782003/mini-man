'use client';

import React, { useCallback, useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCatalogFilters, useCatalogCategories } from '@/lib/hooks/useCatalog';
import type { ApiCategory } from '@/lib/hooks/useCatalog';
import { Slider } from '@/components/ui/slider';
import { intlLocale } from '@/lib/intl';

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface FiltersSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface LocalFilters {
  sizes: string[];
  categoryIds: number[];
  subCategoryIds: number[];
  collectionIds: number[];
  isAvailable: string | null;
  minPrice: number | null;
  maxPrice: number | null;
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width={16} height={16} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function AccordionSection({ title, children, defaultOpen = false }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();
  const handleToggle = useCallback(() => setIsOpen((p) => !p), []);
  return (
    <div className="border-t border-gray-200 py-4">
      <button type="button" className="flex w-full items-center justify-between text-start" onClick={handleToggle} aria-expanded={isOpen} aria-controls={contentId}>
        <span className="font-beatrice text-[16px] font-medium text-black">{title}</span>
        <ChevronDownIcon className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div id={contentId} className="mt-3">{children}</div>}
    </div>
  );
}

function parseIds(param: string | null): number[] {
  return param?.split(',').filter(Boolean).map(Number) ?? [];
}

const SIZES_VISIBLE = 8;

function SizesSection({ sizes, selected, loading, onToggle }: {
  sizes: string[];
  selected: string[];
  loading: boolean;
  onToggle: (size: string) => void;
}) {
  const t = useTranslations('Products');
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? sizes : sizes.slice(0, SIZES_VISIBLE);

  return (
    <div className="border-t border-gray-200 py-6">
      <p className="mb-5 font-beatrice text-[16px] font-bold text-black">{t('size')}</p>
      {loading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: SIZES_VISIBLE }).map((_, i) => (
            <div key={i} className="h-9 w-9 animate-pulse bg-neutral-200" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {visible.map((size) => {
              const isSelected = selected.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onToggle(size)}
                  aria-pressed={isSelected}
                  className={`h-9 min-w-[36px] border px-2 text-[13px] font-beatrice font-medium transition-colors ${isSelected ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-black hover:border-black'}`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {sizes.length > SIZES_VISIBLE && (
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className="mt-3 font-beatrice text-[13px] text-gray-500 underline underline-offset-2 hover:text-black"
            >
              {expanded ? t('seeLess') : t('seeMoreCount', { count: sizes.length - SIZES_VISIBLE })}
            </button>
          )}
        </>
      )}
    </div>
  );
}

const CATS_VISIBLE = 6;

function CategoriesList({ categories, categoryIds, subCategoryIds, onCategoryChange, onSubCategoryChange }: {
  categories: ApiCategory[];
  categoryIds: number[];
  subCategoryIds: number[];
  onCategoryChange: (cat: ApiCategory) => void;
  onSubCategoryChange: (catId: number, subId: number) => void;
}) {
  const t = useTranslations('Products');
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? categories : categories.slice(0, CATS_VISIBLE);

  return (
    <div className="flex flex-col gap-1">
      {visible.map((cat) => (
        <div key={cat.id}>
          <label className="flex cursor-pointer items-center gap-2.5 py-1">
            <input
              type="checkbox"
              checked={categoryIds.includes(cat.id)}
              onChange={() => onCategoryChange(cat)}
              className="h-4 w-4 cursor-pointer accent-black"
            />
            <span className="font-beatrice text-[14px] font-medium text-black">{cat.name}</span>
          </label>
          {(cat.subCategories?.length ?? 0) > 0 && (
            <div className="ms-6 flex flex-col gap-0.5">
              {cat.subCategories.map((sub) => (
                <label key={sub.id} className="flex cursor-pointer items-center gap-2.5 py-0.5">
                  <input
                    type="checkbox"
                    checked={subCategoryIds.includes(sub.id)}
                    onChange={() => onSubCategoryChange(cat.id, sub.id)}
                    className="h-4 w-4 cursor-pointer accent-black"
                  />
                  <span className="font-beatrice text-[13px] text-gray-600">{sub.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      {categories.length > CATS_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="mt-1 text-start font-beatrice text-[13px] text-gray-500 underline underline-offset-2 hover:text-black"
        >
          {expanded ? t('seeLess') : t('seeMoreCount', { count: categories.length - CATS_VISIBLE })}
        </button>
      )}
    </div>
  );
}

function readFiltersFromParams(searchParams: ReturnType<typeof useSearchParams>, priceMin: number, priceMax: number): LocalFilters {
  return {
    sizes: searchParams.get('size_name')?.split(',').filter(Boolean) ?? [],
    categoryIds: parseIds(searchParams.get('category_id')),
    subCategoryIds: parseIds(searchParams.get('sub_category_id')),
    collectionIds: parseIds(searchParams.get('collection_id')),
    isAvailable: searchParams.get('is_available'),
    minPrice: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : priceMin,
    maxPrice: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : priceMax,
  };
}

// Typed price: edits locally, filters on blur / Enter, clamped to [min, max].
function PriceInput({ label, value, min, max, onCommit }: {
  label: string; value: number; min: number; max: number; onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);

  const commit = () => {
    const n = Number(draft);
    if (!Number.isFinite(n) || draft.trim() === '') { setDraft(String(value)); return; }
    const clamped = Math.min(max, Math.max(min, Math.round(n)));
    setDraft(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={label}
      value={draft}
      min={min}
      max={max}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
      className="w-full min-w-0 rounded-lg border border-gray-300 px-2 py-1.5 text-center tabular-nums focus:border-black focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  );
}

// URL params owned by other controls (search box, sort dropdown) that filtering keeps.
const PRESERVED_PARAMS = ['search', 'sort_by', 'sort_order'] as const;

export default function FiltersSidebar({ isOpen = false, onClose }: FiltersSidebarProps) {
  const t = useTranslations('Products');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: filtersData, isPending: filtersLoading } = useCatalogFilters();
  const { data: categoriesData, isPending: categoriesLoading } = useCatalogCategories();

  const filters = filtersData?.data;
  const priceMin = filters?.price_range.min ?? 0;
  const priceMax = filters?.price_range.max ?? 10000;

  const [local, setLocal] = useState<LocalFilters>({
    sizes: [],
    categoryIds: [],
    subCategoryIds: [],
    collectionIds: [],
    isAvailable: null,
    minPrice: priceMin,
    maxPrice: priceMax,
  });

  // Sync local state from URL whenever searchParams or price range changes
  useEffect(() => {
    setLocal(readFiltersFromParams(searchParams, priceMin, priceMax));
  }, [searchParams, priceMin, priceMax]);

  // Every selection filters immediately — update local state and the URL together.
  function update(change: (prev: LocalFilters) => LocalFilters) {
    const next = change(local);
    setLocal(next);
    pushFilters(next);
  }

  function toggleSize(size: string) {
    update((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  }

  function toggleAvailability(val: string) {
    update((prev) => ({ ...prev, isAvailable: prev.isAvailable === val ? null : val }));
  }

  function pushFilters(local: LocalFilters) {
    const params = new URLSearchParams();
    // Preserve search and sort — they aren't filters.
    for (const key of PRESERVED_PARAMS) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }

    if (local.sizes.length > 0) params.set('size_name', local.sizes.join(','));
    if (local.collectionIds.length > 0) params.set('collection_id', local.collectionIds.join(','));
    if (local.categoryIds.length > 0) params.set('category_id', local.categoryIds.join(','));
    if (local.subCategoryIds.length > 0) params.set('sub_category_id', local.subCategoryIds.join(','));
    if (local.isAvailable != null) params.set('is_available', local.isAvailable);
    if (local.minPrice != null && local.minPrice > priceMin) params.set('min_price', String(local.minPrice));
    if (local.maxPrice != null && local.maxPrice < priceMax) params.set('max_price', String(local.maxPrice));

    const query = params.toString();
    // replace (not push) so each click doesn't add a history entry; keep the scroll position.
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function clearAll() {
    const fresh: LocalFilters = {
      sizes: [],
      categoryIds: [],
      subCategoryIds: [],
      collectionIds: [],
      isAvailable: null,
      minPrice: priceMin,
      maxPrice: priceMax,
    };
    setLocal(fresh);
    const params = new URLSearchParams();
    for (const key of PRESERVED_PARAMS) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`
        fixed top-0 z-50 h-full w-[300px] shrink-0 overflow-y-auto bg-white p-6
        ltr:left-0 rtl:right-0
        transition-transform duration-300
        md:sticky md:top-[calc(var(--header-h,7rem)+1.5rem)] md:z-auto md:h-auto md:max-h-[calc(100vh-var(--header-h,7rem)-3rem)] md:w-[265px] md:overflow-y-auto md:overscroll-contain md:p-0 no-scrollbar md:translate-x-0
        ${isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full md:!translate-x-0'}
      `}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-beatrice text-[22px] font-bold uppercase tracking-widest text-black">{t('filters')}</h2>
          <button type="button" className="p-1 text-gray-500 transition-colors hover:text-black md:hidden" onClick={onClose} aria-label={t('closeFilters')}>
            <X size={20} />
          </button>
        </div>

        {/* Sizes */}
        <SizesSection
          sizes={filters?.sizes ?? []}
          selected={local.sizes}
          loading={filtersLoading}
          onToggle={toggleSize}
        />

        {/* Collections */}
        {(filtersLoading || (filters?.collections?.length ?? 0) > 0) && (
          <AccordionSection title={t('collections')} defaultOpen>
            {filtersLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filters?.collections.map((col) => (
                  <label key={col.id} className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={local.collectionIds.includes(col.id)}
                      onChange={() => update((p) => ({
                        ...p,
                        collectionIds: p.collectionIds.includes(col.id)
                          ? p.collectionIds.filter((id) => id !== col.id)
                          : [...p.collectionIds, col.id],
                      }))}
                      className="h-4 w-4 cursor-pointer accent-black"
                    />
                    <span className="font-beatrice text-[14px] text-black">{col.name}</span>
                  </label>
                ))}
              </div>
            )}
          </AccordionSection>
        )}

        {/* Categories */}
        <AccordionSection title={t('categories')} defaultOpen>
          {categoriesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />)}
            </div>
          ) : (
            <CategoriesList
              categories={categoriesData?.data ?? []}
              categoryIds={local.categoryIds}
              subCategoryIds={local.subCategoryIds}
              onCategoryChange={(cat) => update((p) => {
                const removing = p.categoryIds.includes(cat.id);
                const subIds = cat.subCategories?.map((s) => s.id) ?? [];
                return {
                  ...p,
                  categoryIds: removing
                    ? p.categoryIds.filter((id) => id !== cat.id)
                    : [...p.categoryIds, cat.id],
                  subCategoryIds: removing
                    ? p.subCategoryIds.filter((id) => !subIds.includes(id))
                    : [...p.subCategoryIds.filter((id) => !subIds.includes(id)), ...subIds],
                };
              })}
              onSubCategoryChange={(catId, subId) => update((p) => ({
                ...p,
                subCategoryIds: p.subCategoryIds.includes(subId)
                  ? p.subCategoryIds.filter((id) => id !== subId)
                  : [...p.subCategoryIds, subId],
              }))}
            />
          )}
        </AccordionSection>

        {/* Availability */}
        <AccordionSection title={t('availability')} defaultOpen>
          {/* The API returns in-stock products by default and can't mix both — so it's a single toggle. */}
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={local.isAvailable === '0'}
              onChange={() => toggleAvailability('0')}
              className="h-4 w-4 cursor-pointer accent-black"
            />
            <span className="font-beatrice text-[14px] text-black">
              {t('outOfStockOnly')}{' '}
              {filters && <span className="font-semibold text-red-500">({filters.availability.out_of_stock})</span>}
            </span>
          </label>
        </AccordionSection>

        {/* Price Range */}
        <AccordionSection title={t('shopByPrice')}>
          <div className="space-y-4">
            <Slider
              min={priceMin}
              max={priceMax}
              step={1}
              value={[local.minPrice ?? priceMin, local.maxPrice ?? priceMax]}
              onValueChange={(val) => {
                const [min, max] = val as number[];
                setLocal((p) => ({ ...p, minPrice: min, maxPrice: max }));
              }}
              onValueCommitted={(val) => {
                const [min, max] = val as number[];
                update((p) => ({ ...p, minPrice: min, maxPrice: max }));
              }}
              className="mt-2"
            />
            <div className="flex items-center gap-2 font-beatrice text-[13px] text-gray-700">
              <PriceInput
                label={t('minPrice')}
                value={local.minPrice ?? priceMin}
                min={priceMin}
                max={local.maxPrice ?? priceMax}
                onCommit={(min) => update((p) => ({ ...p, minPrice: min }))}
              />
              <span className="text-gray-400">—</span>
              <PriceInput
                label={t('maxPrice')}
                value={local.maxPrice ?? priceMax}
                min={local.minPrice ?? priceMin}
                max={priceMax}
                onCommit={(max) => update((p) => ({ ...p, maxPrice: max }))}
              />
            </div>
          </div>
        </AccordionSection>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-black py-3.5 md:hidden font-beatrice text-[13px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            {t('viewResults')}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="w-full border border-gray-300 py-3 font-beatrice text-[12px] font-semibold uppercase tracking-widest text-gray-500 transition-colors hover:border-black hover:text-black"
          >
            {t('clearAll')}
          </button>
        </div>
      </aside>
    </>
  );
}
