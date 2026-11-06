import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { get } from '@/lib/fetcher';
import type { Country } from '@/lib/countries';
import { allDialCountries } from '@/lib/dial-codes';

interface PhoneCode {
  iso: string;
  name: string | null;
  phone_code: string;
  flag: string | null;
  is_default: boolean;
}

// Only unique inside this list; never sent to the backend.
const ID_OFFSET = 200000;

/** Default country first (Egypt), then the API's order. */
function toCountries(codes: PhoneCode[]): Country[] {
  const sorted = [...codes].sort((a, b) => Number(b.is_default) - Number(a.is_default));
  // flag_url null → the Flag component shows the emoji for the ISO code.
  return sorted.map((c, i) => ({ id: ID_OFFSET + i, code: c.iso, phone_code: c.phone_code, flag_url: null, name: c.name }));
}

/**
 * Every country's dial code for the phone picker (GET /user/auth/phone-codes), localized.
 * Not the shipping countries. Falls back to the bundled list while loading or if the request fails.
 */
export function usePhoneCodes(): Country[] {
  const locale = useLocale();
  const { data } = useQuery({
    queryKey: ['phone-codes', locale],
    queryFn: () => get<{ data: PhoneCode[] }>('/user/auth/phone-codes').then((r) => toCountries(r.data ?? [])),
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return data && data.length > 0 ? data : allDialCountries(locale);
}
