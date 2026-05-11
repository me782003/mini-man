import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/fetcher';

export interface SiteInfo {
  name: string;
  description: string;
  header_logo: string;
  footer_logo: string;
}

export interface ContactItem {
  value: string;
  icon: string;
}

export interface WhatsappContact {
  value: string;
  icon: string;
}

export interface SocialContact {
  value: string;
  icon: string;
  platform: string;
}

export interface Contacts {
  emails: ContactItem[];
  phone: ContactItem[];
  whatsapp: WhatsappContact;
  socials: SocialContact[];
}

export interface Branch {
  id: number;
  name: string;
  address: string;
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
  items: SettingsTickerItem[];
}

export interface StaticPage {
  id: number;
  slug: string;
  title: string;
  content: string;
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
  tickers: SettingsTickers;
  static_pages: StaticPage[];
  countries: Country[];
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => get<{ data: SettingsData }>('/user/pages/settings'),
    staleTime: 10 * 60 * 1000,
  });
}
