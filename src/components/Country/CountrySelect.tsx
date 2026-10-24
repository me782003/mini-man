'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { countryName, type Country } from '@/lib/countries';
import Flag from './Flag';

interface CountrySelectProps {
    countries: Country[];
    /** The selected country id (0 / null = none). */
    value: number | null;
    onChange: (id: number) => void;
    /** Options that fail this are shown but can't be picked (e.g. no delivery there). */
    isSelectable?: (country: Country) => boolean;
    disabledHint?: string;
    invalid?: boolean;
    disabled?: boolean;
}

/** Searchable country dropdown — matches the localized name, the ISO code and the dial code. */
export default function CountrySelect({ countries, value, onChange, isSelectable, disabledHint, invalid, disabled }: CountrySelectProps) {
    const t = useTranslations('Country');
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = countries.find((c) => c.id === value);
    const q = search.trim().toLowerCase();
    const filtered = q
        ? countries.filter((c) =>
            countryName(c).toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q) ||
            c.phone_code.replace('+', '').includes(q.replace('+', '')))
        : countries;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                aria-label={t('country')}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => { setOpen((v) => !v); setSearch(''); }}
                className={`flex w-full items-center justify-between gap-2 border px-4 py-3 text-start font-beatrice text-[14px] transition-colors ${open ? 'border-black' : invalid ? 'border-red-400' : 'border-gray-300'} ${disabled ? 'cursor-not-allowed bg-gray-50 opacity-70' : 'bg-white hover:border-gray-400'}`}
            >
                <span className="flex min-w-0 items-center gap-2">
                    {selected ? (
                        <>
                            <Flag code={selected.code} flagUrl={selected.flag_url} />
                            <span className="truncate text-black">{countryName(selected)}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">{t('selectCountry')}</span>
                    )}
                </span>
                <ChevronDown size={16} className={`shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-full z-50 border border-t-0 border-gray-300 bg-white shadow-lg">
                    <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
                        <Search size={14} className="shrink-0 text-gray-400" />
                        <input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('searchCountry')}
                            className="w-full font-beatrice text-[13px] text-black placeholder:text-gray-400 outline-none"
                        />
                    </div>
                    <ul role="listbox" className="max-h-56 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <li className="px-4 py-3 font-beatrice text-[13px] text-gray-400">{t('noResults')}</li>
                        ) : (
                            filtered.map((c) => {
                                const allowed = isSelectable ? isSelectable(c) : true;
                                return (
                                    <li key={c.id} role="option" aria-selected={c.id === value} aria-disabled={!allowed}>
                                        <button
                                            type="button"
                                            disabled={!allowed}
                                            title={!allowed ? disabledHint : undefined}
                                            onClick={() => { onChange(c.id); setOpen(false); setSearch(''); }}
                                            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-start font-beatrice text-[14px] text-black transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
                                        >
                                            <span className="flex min-w-0 items-center gap-2">
                                                <Flag code={c.code} flagUrl={c.flag_url} />
                                                <span className="truncate">{countryName(c)}</span>
                                                <span className="shrink-0 text-[12px] text-gray-400">{c.code}</span>
                                            </span>
                                            {c.id === value && <Check size={14} className="shrink-0 text-black" />}
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                    {disabledHint && isSelectable && countries.some((c) => !isSelectable(c)) && (
                        <p className="border-t border-gray-200 bg-gray-50 px-4 py-2 font-beatrice text-[12px] text-gray-500">{disabledHint}</p>
                    )}
                </div>
            )}
        </div>
    );
}
