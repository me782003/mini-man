// Server-side settings fetch (layouts, metadata, static pages). Cached by Next for 1 minute, so
// dashboard changes (tickers on/off, new tickers, contacts) show up quickly.
import { API_BASE_URL } from '@/lib/fetcher';
import type { SettingsData } from '@/lib/hooks/useSettings';

export async function getSettings(locale: string): Promise<SettingsData | null> {
  try {
    // The locale is in the URL too: it keeps the Arabic and English copies in separate cache
    // entries, so an Arabic page is never seeded with the English ticker (and vice versa).
    const res = await fetch(`${API_BASE_URL}/user/pages/settings?locale=${locale}`, {
      headers: { locale },
      next: { revalidate: 60, tags: ['settings', `settings-${locale}`] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: SettingsData };
    return json.data ?? null;
  } catch {
    // API down: the layout renders with the bundled defaults.
    return null;
  }
}
