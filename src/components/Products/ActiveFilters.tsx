'use client';

import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCatalogCategories, useCatalogFilters } from '@/lib/hooks/useCatalog';
import { intlLocale } from '@/lib/intl';

// URL params owned by other controls — "Clear all" keeps them.
const PRESERVED_PARAMS = ['search', 'sort_by', 'sort_order'] as const;

interface Chip {
    key: string;
    label: string;
    remove: (params: URLSearchParams) => void;
}

// Removes one value from a comma-separated param, dropping the param when it empties.
function removeListValue(params: URLSearchParams, name: string, value: string) {
    const rest = (params.get(name) ?? '').split(',').filter((v) => v && v !== value);
    if (rest.length > 0) params.set(name, rest.join(','));
    else params.delete(name);
}

export default function ActiveFilters() {
    const t = useTranslations('Products');
    const tc = useTranslations('Common');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: filtersData } = useCatalogFilters();
    const { data: categoriesData } = useCatalogCategories();

    const collections = filtersData?.data.collections ?? [];
    const categories = categoriesData?.data ?? [];
    const subCategories = categories.flatMap((c) => c.subCategories ?? []);
    const money = (n: number) => tc('currency', { amount: n.toLocaleString(intlLocale(locale)) });

    const list = (name: string) => (searchParams.get(name) ?? '').split(',').filter(Boolean);
    const chips: Chip[] = [];

    for (const id of list('collection_id')) {
        const name = collections.find((c) => String(c.id) === id)?.name;
        if (name) chips.push({ key: `col-${id}`, label: name, remove: (p) => removeListValue(p, 'collection_id', id) });
    }
    for (const id of list('category_id')) {
        const name = categories.find((c) => String(c.id) === id)?.name;
        if (name) chips.push({ key: `cat-${id}`, label: name, remove: (p) => removeListValue(p, 'category_id', id) });
    }
    for (const id of list('sub_category_id')) {
        const name = subCategories.find((c) => String(c.id) === id)?.name;
        if (name) chips.push({ key: `sub-${id}`, label: name, remove: (p) => removeListValue(p, 'sub_category_id', id) });
    }
    for (const size of list('size_name')) {
        chips.push({ key: `size-${size}`, label: `${tc('size')}: ${size}`, remove: (p) => removeListValue(p, 'size_name', size) });
    }
    if (searchParams.get('is_available') === '0') {
        chips.push({ key: 'oos', label: t('outOfStockOnly'), remove: (p) => p.delete('is_available') });
    }
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    if (minPrice || maxPrice) {
        const lo = minPrice ? money(Number(minPrice)) : '';
        const hi = maxPrice ? money(Number(maxPrice)) : '';
        chips.push({
            key: 'price',
            label: lo && hi ? `${lo} – ${hi}` : lo ? `≥ ${lo}` : `≤ ${hi}`,
            remove: (p) => { p.delete('min_price'); p.delete('max_price'); },
        });
    }

    if (chips.length === 0) return null;

    const navigate = (params: URLSearchParams) => {
        params.delete('page');
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    };

    const removeChip = (chip: Chip) => {
        const params = new URLSearchParams(searchParams.toString());
        chip.remove(params);
        navigate(params);
    };

    const clearAll = () => {
        const params = new URLSearchParams();
        for (const key of PRESERVED_PARAMS) {
            const value = searchParams.get(key);
            if (value) params.set(key, value);
        }
        navigate(params);
    };

    return (
        <div className="mb-5 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
                <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeChip(chip)}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white py-1.5 pe-2 ps-3 font-beatrice text-[12px] font-medium text-black transition-colors hover:border-black"
                    aria-label={t('removeFilter', { name: chip.label })}
                >
                    {chip.label}
                    <X size={14} className="text-gray-400 transition-colors group-hover:text-black" />
                </button>
            ))}
            <button
                type="button"
                onClick={clearAll}
                className="px-2 py-1.5 font-beatrice text-[12px] font-semibold text-gray-500 underline underline-offset-2 hover:text-black"
            >
                {t('clearAll')}
            </button>
        </div>
    );
}
