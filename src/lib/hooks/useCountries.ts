import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { get } from '@/lib/fetcher';
import { getCountryByCode, getCountryById, getDefaultCountry, type Country } from '@/lib/countries';

export type { Country } from '@/lib/countries';

interface CountriesResponse {
  data: Country[];
}

// Names are localized, so cache per language. The list rarely changes — a session is fine.
const cacheKey = (locale: string) => `countries:${locale}`;

function readCache(locale: string): Country[] | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.sessionStorage.getItem(cacheKey(locale));
    return raw ? (JSON.parse(raw) as Country[]) : undefined;
  } catch {
    return undefined;
  }
}

function writeCache(locale: string, countries: Country[]) {
  try {
    window.sessionStorage.setItem(cacheKey(locale), JSON.stringify(countries));
  } catch {
    // Storage blocked — the in-memory query cache still works.
  }
}

export function useCountries() {
  const locale = useLocale();
  return useQuery({
    // Keyed by locale so switching language refetches the translated names.
    queryKey: ['countries', locale],
    queryFn: async () => {
      const countries = (await get<CountriesResponse>('/user/auth/countries')).data ?? [];
      writeCache(locale, countries);
      return countries;
    },
    initialData: () => readCache(locale),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/** The countries list plus lookup helpers bound to it. */
export function useCountryHelpers() {
  const query = useCountries();
  const countries = query.data ?? [];
  return {
    ...query,
    countries,
    getCountryById: (id: number | null | undefined) => getCountryById(countries, id),
    getCountryByCode: (code: string | null | undefined) => getCountryByCode(countries, code),
    getDefaultCountry: () => getDefaultCountry(countries),
  };
}
