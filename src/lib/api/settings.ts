// Server-side settings fetch (layouts, metadata, static pages). Cached by Next for 5 minutes.
import { API_BASE_URL } from '@/lib/fetcher';
import type { SettingsData } from '@/lib/hooks/useSettings';

export async function getSettings(locale: string): Promise<SettingsData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/user/pages/settings`, {
      headers: { locale },
      next: { revalidate: 300, tags: ['settings'] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: SettingsData };
    return json.data ?? null;
  } catch {
    // API down: the layout renders with the bundled defaults.
    return null;
  }
}
