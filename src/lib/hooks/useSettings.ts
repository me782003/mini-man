import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { get } from '@/lib/fetcher';

export interface SiteInfo {
  name: string | null;
  description: string | null;
  header_logo: string | null;
  footer_logo: string | null;
}

export interface ContactItem {
  value: string;
  icon: string | null;
}

export interface WhatsappContact {
  value: string;
  icon: string | null;
}

export interface SocialContact {
  value: string;
  icon: string | null;
  platform: string;
}

export interface Contacts {
  emails: ContactItem[];
  phone: ContactItem[];
  /** An object, not a list — `{}` when there's no WhatsApp number. */
  whatsapp: Partial<WhatsappContact>;
  socials: SocialContact[];
}

export interface Branch {
  id: number;
  name: string | null;
  address: string | null;
  phone: string;
  email: string | null;
  map_link: string | null;
  main_image: string | null;
  is_main: number;
  additional_images: string[];
}

export interface SettingsTickerItem {
  id: number;
  primary_text: string | null;
  secondary_text: string | null;
  primary_text_color: string;
  secondary_text_color: string;
}

export interface SettingsTickers {
  background?: string | null;
  items: SettingsTickerItem[];
}

export interface StaticPage {
  id: number;
  slug: string;
  title: string | null;
  content: string | null;
}

export interface Country {
  id: number;
  code: string;
  phone_code: string;
  name: string;
}

export interface SettingsData {
  site_info: SiteInfo;
  contacts: Contacts;
  branches: Branch[];
  /** null when the ticker is turned off. */
  tickers: SettingsTickers | null;
  static_pages: StaticPage[];
  countries: Country[];
}

export const DEFAULT_SITE_NAME = 'Mini Man';

export const settingsKey = (locale: string) => ['settings', locale] as const;
const cacheKey = (locale: string) => `settings:${locale}`;

function readCache(locale: string): { data: SettingsData } | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.sessionStorage.getItem(cacheKey(locale));
    return raw ? { data: JSON.parse(raw) as SettingsData } : undefined;
  } catch {
    return undefined;
  }
}

function writeCache(locale: string, data: SettingsData) {
  try {
    window.sessionStorage.setItem(cacheKey(locale), JSON.stringify(data));
  } catch {
    // Storage blocked — the in-memory query cache still works.
  }
}

/**
 * Site-wide settings, per language. The [locale] layout fetches them on the server and seeds
 * this cache (no header/footer flash); the browser refreshes them in the background.
 */
export function useSettings() {
  const locale = useLocale();
  return useQuery({
    queryKey: settingsKey(locale),
    queryFn: async () => {
      const res = await get<{ data: SettingsData }>('/user/pages/settings');
      writeCache(locale, res.data);
      return res;
    },
    initialData: () => readCache(locale),
    initialDataUpdatedAt: 0, // treat the session cache as stale → refresh once in the background
    staleTime: 10 * 60 * 1000,
  });
}
