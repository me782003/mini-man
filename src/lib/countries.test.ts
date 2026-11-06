import { describe, expect, it } from 'vitest';
import {
  countryName,
  flagEmoji,
  formatPhoneForBackend,
  getCountryByCode,
  getCountryById,
  getDefaultCountry,
  isValidPhone,
  normalizeEgyptianPhone,
  parseStoredPhone,
  phonePayload,
  type Country,
} from './countries';

const countries: Country[] = [
  { id: 5, code: 'EG', phone_code: '+20', flag_url: null, name: 'Egypt' },
  { id: 2, code: 'BH', phone_code: '+973', flag_url: null, name: null },
];

describe('lookups', () => {
  it('finds by id, by code (any case) and the Egypt default', () => {
    expect(getCountryById(countries, 2)?.code).toBe('BH');
    expect(getCountryByCode(countries, 'eg')?.id).toBe(5);
    expect(getDefaultCountry(countries)?.id).toBe(5);
    expect(getCountryById(countries, 99)).toBeUndefined();
  });

  it('falls back to the code when the name is missing', () => {
    expect(countryName(countries[1])).toBe('BH');
  });

  it('builds flag emoji from the code', () => {
    expect(flagEmoji('EG')).toBe('🇪🇬');
    expect(flagEmoji('bh')).toBe('🇧🇭');
  });
});

describe('phones', () => {
  it('normalizes pasted Egyptian numbers to 01…', () => {
    for (const raw of ['01012345678', '+201012345678', '00201012345678', '010 1234-5678']) {
      expect(normalizeEgyptianPhone(raw)).toBe('01012345678');
    }
  });

  it('formats for the backend per country', () => {
    expect(formatPhoneForBackend(countries[0], '+20 101 234 5678')).toBe('01012345678');
    expect(formatPhoneForBackend(countries[1], '033123456')).toBe('+97333123456');
  });

  it('splits stored numbers back into country + local part', () => {
    expect(parseStoredPhone(countries, '+97333123456')).toEqual({ country: countries[1], local: '33123456' });
    expect(parseStoredPhone(countries, '01012345678').country?.code).toBe('EG');
  });

  it('validates Egyptian and international formats', () => {
    expect(isValidPhone('01012345678')).toBe(true);
    expect(isValidPhone('0101234567')).toBe(false);
    expect(isValidPhone('+97333123456')).toBe(true);
  });
});

describe('phonePayload', () => {
  it('splits numbers into phone + phone_code', () => {
    expect(phonePayload('01012345678')).toEqual({ phone: '1012345678', phone_code: '+20' });
    expect(phonePayload('+201012345678')).toEqual({ phone: '1012345678', phone_code: '+20' });
    expect(phonePayload('+966501234567')).toEqual({ phone: '501234567', phone_code: '+966' });
    expect(phonePayload('+97150123456')).toEqual({ phone: '50123456', phone_code: '+971' });
  });
});
