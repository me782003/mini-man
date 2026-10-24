'use client';

import { countryName } from '@/lib/countries';
import { useCountryHelpers } from '@/lib/hooks/useCountries';
import Flag from './Flag';

interface CountryBadgeProps {
    countryId?: number | null;
    code?: string | null;
    /** Fallbacks from the address itself (e.g. `country_name`) for countries no longer in the active list. */
    name?: string | null;
    flagUrl?: string | null;
    className?: string;
}

/** Flag + country name, resolved from the countries list by id or code. */
export default function CountryBadge({ countryId, code, name, flagUrl, className = '' }: CountryBadgeProps) {
    const { getCountryById, getCountryByCode } = useCountryHelpers();
    const country = getCountryById(countryId) ?? getCountryByCode(code);

    // Deactivated country: show the address's own name, without a flag.
    if (!country) {
        const label = name || code;
        return label ? <span className={className}>{label}</span> : null;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 ${className}`}>
            <Flag code={country.code} flagUrl={country.flag_url ?? flagUrl} className="h-3.5 w-5" />
            <span>{countryName(country)}</span>
        </span>
    );
}
