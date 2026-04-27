'use client';

import React, { useCallback, useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCatalogFilters } from '@/lib/hooks/useCatalog';
import { Slider } from '@/components/ui/slider';

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
  categoryId: number | null;
  subCategoryId: number | null;
  collectionId: number | null;
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
      <button type="button" className="flex w-full items-center justify-between text-left" onClick={handleToggle} aria-expanded={isOpen} aria-controls={contentId}>
        <span className="font-beatrice text-[16px] font-medium text-black">{title}</span>
        <ChevronDownIcon className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div id={contentId} className="mt-3">{children}</div>}
    </div>
  );
}

function readFiltersFromParams(searchParams: ReturnType<typeof useSearchParams>, priceMin: number, priceMax: number): LocalFilters {
  return {
    sizes: searchParams.get('size_name')?.split(',').filter(Boolean) ?? [],
    categoryId: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : null,
    subCategoryId: searchParams.get('sub_category_id') ? Number(searchParams.get('sub_category_id')) : null,
    collectionId: searchParams.get('collection_id') ? Number(searchParams.get('collection_id')) : null,
    isAvailable: searchParams.get('is_available'),
    minPrice: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : priceMin,
    maxPrice: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : priceMax,
  };
}

export default function FiltersSidebar({ isOpen = false, onClose }: FiltersSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: filtersData, isPending: filtersLoading } = useCatalogFilters();

  const filters = filtersData?.data;
  const priceMin = filters?.price_range.min ?? 0;
  const priceMax = filters?.price_range.max ?? 10000;

  const [local, setLocal] = useState<LocalFilters>({
    sizes: [],
    categoryId: null,
    subCategoryId: null,
    collectionId: null,
    isAvailable: null,
    minPrice: priceMin,
    maxPrice: priceMax,
  });

  // Sync local state from URL whenever searchParams or price range changes
  useEffect(() => {
    setLocal(readFiltersFromParams(searchParams, priceMin, priceMax));
  }, [searchParams, priceMin, priceMax]);

  function toggleSize(size: string) {
    setLocal((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  }

  function toggleAvailability(val: string) {
    setLocal((prev) => ({ ...prev, isAvailable: prev.isAvailable === val ? null : val }));
  }

  function applyFilters() {
    const params = new URLSearchParams();
    // Preserve search if present
    const search = searchParams.get('search');
    if (search) params.set('search', search);

    if (local.sizes.length > 0) params.set('size_name', local.sizes.join(','));
    if (local.collectionId != null) params.set('collection_id', String(local.collectionId));
    if (local.categoryId != null) params.set('category_id', String(local.categoryId));
    if (local.subCategoryId != null) params.set('sub_category_id', String(local.subCategoryId));
    if (local.isAvailable != null) params.set('is_available', local.isAvailable);
    if (local.minPrice != null && local.minPrice > priceMin) params.set('min_price', String(local.minPrice));
    if (local.maxPrice != null && local.maxPrice < priceMax) params.set('max_price', String(local.maxPrice));

    router.push(`${pathname}?${params.toString()}`);
    onClose?.();
  }

  function clearAll() {
    const fresh: LocalFilters = {
      sizes: [],
      categoryId: null,
      subCategoryId: null,
      collectionId: null,
      isAvailable: null,
      minPrice: priceMin,
      maxPrice: priceMax,
    };
    setLocal(fresh);
    const search = searchParams.get('search');
    router.push(search ? `${pathname}?search=${encodeURIComponent(search)}` : pathname);
    onClose?.();
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
        md:static md:z-auto md:h-auto md:w-[265px] md:overflow-visible md:p-0 md:translate-x-0
        ${isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full md:!translate-x-0'}
      `}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-beatrice text-[22px] font-bold uppercase tracking-widest text-black">Filters</h2>
          <button type="button" className="p-1 text-gray-500 transition-colors hover:text-black md:hidden" onClick={onClose} aria-label="Close filters">
            <X size={20} />
          </button>
        </div>

        {/* Sizes */}
        <div className="border-t border-gray-200 py-6">
          <p className="mb-5 font-beatrice text-[16px] font-bold text-black">Size</p>
          {filtersLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 w-9 animate-pulse bg-neutral-200" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(filters?.sizes ?? []).map((size) => {
                const isSelected = local.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    aria-pressed={isSelected}
                    className={`h-9 min-w-[36px] border px-2 text-[13px] font-beatrice font-medium transition-colors ${isSelected ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-black hover:border-black'}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Collections */}
        {(filtersLoading || (filters?.collections?.length ?? 0) > 0) && (
          <AccordionSection title="Collections" defaultOpen>
            {filtersLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="radio"
                    name="collection"
                    checked={local.collectionId === null}
                    onChange={() => setLocal((p) => ({ ...p, collectionId: null }))}
                    className="h-4 w-4 cursor-pointer accent-black"
                  />
                  <span className="font-beatrice text-[14px] text-black">All</span>
                </label>
                {filters?.collections.map((col) => (
                  <label key={col.id} className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="radio"
                      name="collection"
                      checked={local.collectionId === col.id}
                      onChange={() => setLocal((p) => ({ ...p, collectionId: col.id }))}
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
        <AccordionSection title="Categories" defaultOpen>
          {filtersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  name="category"
                  checked={local.categoryId === null}
                  onChange={() => setLocal((p) => ({ ...p, categoryId: null, subCategoryId: null }))}
                  className="h-4 w-4 cursor-pointer accent-black"
                />
                <span className="font-beatrice text-[14px] font-medium text-black">All</span>
              </label>
              {filters?.categories.map((cat) => (
                <div key={cat.id}>
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="radio"
                      name="category"
                      checked={local.categoryId === cat.id}
                      onChange={() => setLocal((p) => ({ ...p, categoryId: cat.id, subCategoryId: null }))}
                      className="h-4 w-4 cursor-pointer accent-black"
                    />
                    <span className="font-beatrice text-[14px] font-medium text-black">{cat.name}</span>
                  </label>

                  {local.categoryId === cat.id && (cat.sub_categories?.length ?? 0) > 0 && (
                    <div className="ml-6 mt-2 flex flex-col gap-2">
                      <label className="flex cursor-pointer items-center gap-2.5">
                        <input
                          type="radio"
                          name="sub_category"
                          checked={local.subCategoryId === null}
                          onChange={() => setLocal((p) => ({ ...p, subCategoryId: null }))}
                          className="h-4 w-4 cursor-pointer accent-black"
                        />
                        <span className="font-beatrice text-[13px] text-black">All</span>
                      </label>
                      {(cat.sub_categories ?? []).map((sub) => (
                        <label key={sub.id} className="flex cursor-pointer items-center gap-2.5">
                          <input
                            type="radio"
                            name="sub_category"
                            checked={local.subCategoryId === sub.id}
                            onChange={() => setLocal((p) => ({ ...p, subCategoryId: sub.id }))}
                            className="h-4 w-4 cursor-pointer accent-black"
                          />
                          <span className="font-beatrice text-[13px] text-black">{sub.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </AccordionSection>

        {/* Availability */}
        <AccordionSection title="Availability" defaultOpen>
          <label className="mb-2.5 flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={local.isAvailable === '1'}
              onChange={() => toggleAvailability('1')}
              className="h-4 w-4 cursor-pointer accent-black"
            />
            <span className="font-beatrice text-[14px] text-black">
              In Stock{' '}
              {filters && <span className="font-semibold text-red-500">({filters.availability.in_stock})</span>}
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={local.isAvailable === '0'}
              onChange={() => toggleAvailability('0')}
              className="h-4 w-4 cursor-pointer accent-black"
            />
            <span className="font-beatrice text-[14px] text-black">
              Out of Stock{' '}
              {filters && <span className="font-semibold text-red-500">({filters.availability.out_of_stock})</span>}
            </span>
          </label>
        </AccordionSection>

        {/* Price Range */}
        <AccordionSection title="Shop by Price">
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
              className="mt-2"
            />
            <div className="flex items-center justify-between font-beatrice text-[13px] text-gray-700">
              <span className="rounded border border-gray-200 px-2 py-1">{(local.minPrice ?? priceMin).toLocaleString()} EGP</span>
              <span className="text-gray-400">—</span>
              <span className="rounded border border-gray-200 px-2 py-1">{(local.maxPrice ?? priceMax).toLocaleString()} EGP</span>
            </div>
          </div>
        </AccordionSection>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={applyFilters}
            className="w-full bg-black py-3.5 font-beatrice text-[13px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            View Results
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="w-full border border-gray-300 py-3 font-beatrice text-[12px] font-semibold uppercase tracking-widest text-gray-500 transition-colors hover:border-black hover:text-black"
          >
            Clear All
          </button>
        </div>
      </aside>
    </>
  );
}
