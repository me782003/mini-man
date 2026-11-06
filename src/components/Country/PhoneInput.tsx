'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { countryName, formatPhoneForBackend, getDefaultCountry, parseStoredPhone, type Country } from '@/lib/countries';
import { usePhoneCodes } from '@/lib/hooks/usePhoneCodes';
import Flag from './Flag';

interface PhoneInputProps {
    /** Dial-code choices. Default: every country from GET /user/auth/phone-codes (not just the ones we ship to). */
    countries?: Country[];
    /** The stored / backend value ("01XXXXXXXXX" for Egypt, "+<code><number>" otherwise). */
    value: string;
    /** Called with the backend-ready value on every edit. */
    onChange: (value: string) => void;
    invalid?: boolean;
    disabled?: boolean;
}

/** Phone number with a searchable dial-code picker in front (defaults to Egypt +20). */
export default function PhoneInput({ countries: given, value, onChange, invalid, disabled }: PhoneInputProps) {
    const t = useTranslations('Country');
    const phoneCodes = usePhoneCodes();
    const countries = given ?? phoneCodes;
    // Until the user edits, show the stored value split into dial code + local number.
    const parsed = useMemo(() => parseStoredPhone(countries, value), [countries, value]);
    const [edited, setEdited] = useState<{ countryCode: string | null; local: string } | null>(null);
    // Tracked by ISO code: ids differ between the bundled list and the API's.
    const countryCode = edited ? edited.countryCode : parsed.country?.code ?? null;
    const local = edited ? edited.local : parsed.local;
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(''); }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (open) searchRef.current?.focus();
    }, [open]);

    const country = countries.find((c) => c.code === countryCode) ?? getDefaultCountry(countries);

    const q = search.trim().toLowerCase().replace(/^\+/, '');
    const filtered = q
        ? countries.filter((c) =>
            countryName(c).toLowerCase().includes(q) ||
            c.code.toLowerCase() === q ||
            c.phone_code.replace('+', '').startsWith(q))
        : countries;

    const update = (nextLocal: string, nextCountry = country) => {
        // Strip spaces and dashes as the user types.
        const cleaned = nextLocal.replace(/[\s-]/g, '');
        setEdited({ countryCode: nextCountry?.code ?? null, local: cleaned });
        onChange(nextCountry ? formatPhoneForBackend(nextCountry, cleaned) : cleaned);
    };

    return (
        <div ref={ref} dir="ltr" className="relative">
            <div className={`flex items-stretch border ${invalid ? 'border-red-400' : 'border-gray-300'} focus-within:border-black ${disabled ? 'bg-gray-50 opacity-70' : ''}`}>
                <button
                    type="button"
                    onClick={() => { setOpen((v) => !v); setSearch(''); }}
                    disabled={disabled || countries.length <= 1}
                    aria-label={t('countryCode')}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    className="flex shrink-0 items-center gap-1.5 border-e border-gray-300 bg-gray-50 px-3 font-beatrice text-[14px] text-gray-700 disabled:cursor-default"
                >
                    {country ? (
                        <>
                            <Flag code={country.code} flagUrl={country.flag_url} className="h-3.5 w-5" />
                            <span className="tabular-nums">{country.phone_code}</span>
                        </>
                    ) : (
                        <span>+20</span>
                    )}
                    {countries.length > 1 && !disabled && <ChevronDown size={14} className="text-gray-400" />}
                </button>
                <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={local}
                    disabled={disabled}
                    onChange={(e) => update(e.target.value)}
                    placeholder={country && country.code !== 'EG' ? '' : '01xxxxxxxxx'}
                    aria-label={t('phoneNumber')}
                    className="w-full min-w-0 bg-transparent px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed"
                />
            </div>

            {open && (
                <div className="absolute left-0 top-full z-50 w-72 max-w-[calc(100vw-2rem)] border border-gray-300 bg-white shadow-lg">
                    <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
                        <Search size={14} className="shrink-0 text-gray-400" />
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('searchCountry')}
                            dir="auto"
                            className="w-full font-beatrice text-[13px] text-black placeholder:text-gray-400 outline-none"
                        />
                    </div>
                    <ul role="listbox" className="max-h-56 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-3 font-beatrice text-[13px] text-gray-400">{t('noResults')}</li>
                        ) : filtered.map((c) => (
                            <li key={c.id} role="option" aria-selected={c.id === country?.id}>
                                <button
                                    type="button"
                                    onClick={() => { setOpen(false); setSearch(''); update(local, c); }}
                                    className={`flex w-full items-center gap-2 px-3 py-2 font-beatrice text-[13px] hover:bg-gray-50 ${c.id === country?.id ? 'font-semibold' : ''}`}
                                >
                                    <Flag code={c.code} flagUrl={c.flag_url} className="h-3.5 w-5" />
                                    <span className="w-12 shrink-0 tabular-nums text-gray-600">{c.phone_code}</span>
                                    <span dir="auto" className="truncate">{countryName(c)}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
