'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { countryName, formatPhoneForBackend, getDefaultCountry, parseStoredPhone, type Country } from '@/lib/countries';
import Flag from './Flag';

interface PhoneInputProps {
    countries: Country[];
    /** The stored / backend value ("01XXXXXXXXX" for Egypt, "+<code><number>" otherwise). */
    value: string;
    /** Called with the backend-ready value on every edit. */
    onChange: (value: string) => void;
    invalid?: boolean;
}

/** Phone number with a dial-code picker in front (defaults to Egypt +20). */
export default function PhoneInput({ countries, value, onChange, invalid }: PhoneInputProps) {
    const t = useTranslations('Country');
    // Until the user edits, show the stored value split into dial code + local number.
    const parsed = useMemo(() => parseStoredPhone(countries, value), [countries, value]);
    const [edited, setEdited] = useState<{ countryId: number | null; local: string } | null>(null);
    const countryId = edited ? edited.countryId : parsed.country?.id ?? null;
    const local = edited ? edited.local : parsed.local;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const country = countries.find((c) => c.id === countryId) ?? getDefaultCountry(countries);

    const update = (nextLocal: string, nextCountry = country) => {
        // Strip spaces and dashes as the user types.
        const cleaned = nextLocal.replace(/[\s-]/g, '');
        setEdited({ countryId: nextCountry?.id ?? null, local: cleaned });
        onChange(nextCountry ? formatPhoneForBackend(nextCountry, cleaned) : cleaned);
    };

    return (
        <div ref={ref} dir="ltr" className="relative">
            <div className={`flex items-stretch border ${invalid ? 'border-red-400' : 'border-gray-300'} focus-within:border-black`}>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    disabled={countries.length <= 1}
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
                    {countries.length > 1 && <ChevronDown size={14} className="text-gray-400" />}
                </button>
                <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={local}
                    onChange={(e) => update(e.target.value)}
                    placeholder={country && country.code !== 'EG' ? '' : '01xxxxxxxxx'}
                    aria-label={t('phoneNumber')}
                    className="w-full min-w-0 px-4 py-3 font-beatrice text-[14px] text-black placeholder:text-gray-400 focus:outline-none"
                />
            </div>

            {open && (
                <ul role="listbox" className="absolute left-0 top-full z-50 max-h-56 w-64 overflow-y-auto border border-gray-300 bg-white shadow-lg">
                    {countries.map((c) => (
                        <li key={c.id} role="option" aria-selected={c.id === country?.id}>
                            <button
                                type="button"
                                onClick={() => { setOpen(false); update(local, c); }}
                                className={`flex w-full items-center gap-2 px-3 py-2 font-beatrice text-[13px] hover:bg-gray-50 ${c.id === country?.id ? 'font-semibold' : ''}`}
                            >
                                <Flag code={c.code} flagUrl={c.flag_url} className="h-3.5 w-5" />
                                <span className="tabular-nums text-gray-600">{c.phone_code}</span>
                                <span className="truncate">{countryName(c)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
