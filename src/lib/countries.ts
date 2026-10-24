// Country helpers — pure functions over the /user/auth/countries list (no React).

export interface Country {
  id: number;
  /** ISO 3166-1 alpha-2, e.g. "EG". Look countries up by this, never by id. */
  code: string;
  /** Includes the "+", e.g. "+20". */
  phone_code: string;
  flag_url: string | null;
  /** Localized; null when the translation is missing. */
  name: string | null;
}

/** Shipping (Bosta) only delivers inside Egypt. */
export const SHIPPING_COUNTRY_CODE = 'EG';

export function getCountryById(countries: Country[], id: number | null | undefined): Country | undefined {
  return id == null ? undefined : countries.find((c) => c.id === id);
}

export function getCountryByCode(countries: Country[], code: string | null | undefined): Country | undefined {
  if (!code) return undefined;
  const upper = code.toUpperCase();
  return countries.find((c) => c.code.toUpperCase() === upper);
}

export function getDefaultCountry(countries: Country[]): Country | undefined {
  return getCountryByCode(countries, SHIPPING_COUNTRY_CODE);
}

export function countryName(country: Pick<Country, 'name' | 'code'>): string {
  return country.name || country.code;
}

/** "EG" → "🇪🇬" (regional indicator symbols). */
export function flagEmoji(code: string): string {
  const letters = code.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  if (letters.length !== 2) return '🏳️';
  return String.fromCodePoint(...[...letters].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

// ── Phone numbers ────────────────────────────────────────────────────────────

const EGYPTIAN_MOBILE = /^01\d{9}$/;

/** Accepts 01xxxxxxxxx, +201xxxxxxxxx, 00201xxxxxxxxx, 201xxxxxxxxx (spaces/dashes ignored) → 01xxxxxxxxx. */
export function normalizeEgyptianPhone(raw: string): string {
  const digits = raw.replace(/[\s\-()]/g, '').replace(/^\+/, '');
  if (/^0020\d{10}$/.test(digits)) return `0${digits.slice(4)}`;
  if (/^20\d{10}$/.test(digits)) return `0${digits.slice(2)}`;
  return digits;
}

/**
 * What the backend should receive: Egypt → local "01XXXXXXXXX";
 * other countries → phone_code + the number without its leading zero ("+97333123456").
 */
export function formatPhoneForBackend(country: Pick<Country, 'code' | 'phone_code'>, local: string): string {
  if (country.code.toUpperCase() === SHIPPING_COUNTRY_CODE) return normalizeEgyptianPhone(local);
  const digits = local.replace(/\D/g, '').replace(/^0+/, '');
  return digits ? `${country.phone_code}${digits}` : '';
}

/** Splits a stored phone back into its country + local part (longest matching dial code wins). */
export function parseStoredPhone(countries: Country[], phone: string): { country: Country | undefined; local: string } {
  const egypt = getDefaultCountry(countries);
  const value = phone.replace(/[\s\-()]/g, '');
  if (value.startsWith('+') && !value.startsWith('+20')) {
    const match = [...countries]
      .sort((a, b) => b.phone_code.length - a.phone_code.length)
      .find((c) => value.startsWith(c.phone_code));
    if (match) return { country: match, local: value.slice(match.phone_code.length) };
  }
  return { country: egypt, local: normalizeEgyptianPhone(value) };
}

export function isValidPhone(phone: string): boolean {
  if (EGYPTIAN_MOBILE.test(phone)) return true;
  // International (non-Egyptian) numbers in +<dial code><number> form.
  return /^\+(?!20)\d{7,15}$/.test(phone);
}

export function isEgyptianMobile(phone: string): boolean {
  return EGYPTIAN_MOBILE.test(normalizeEgyptianPhone(phone));
}
