// Base fetch wrapper — use this in all API modules.
// Works in server components (SSR/SSG) and route handlers.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://mini-man.shaarapp.com';

interface FetchOptions extends RequestInit {
  // Next.js cache options
  next?: { revalidate?: number | false; tags?: string[] };
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getLocale(): 'en' | 'ar' {
  if (typeof window === 'undefined') return 'en';
  const match = window.location.pathname.match(/^\/(en|ar)(\/|$)/);
  return (match?.[1] as 'en' | 'ar') ?? 'en';
}

export async function fetcher<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'locale': getLocale(),
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }

  // 204 No Content — return empty
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

export async function fetcherWithStatus<T>(
  path: string,
  options: FetchOptions = {}
): Promise<{ data: T; status: number }> {
  const url = `${BASE_URL}${path}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'locale': getLocale(),
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }

  if (res.status === 204) return { data: undefined as unknown as T, status: 204 };

  const data = await res.json() as T;
  return { data, status: res.status };
}

// Convenience helpers
export const get = <T>(path: string, opts?: FetchOptions) =>
  fetcher<T>(path, { method: 'GET', ...opts });

export const post = <T>(path: string, body: unknown, opts?: FetchOptions) =>
  fetcher<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts });

export const patch = <T>(path: string, body: unknown, opts?: FetchOptions) =>
  fetcher<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...opts });

export const put = <T>(path: string, body: unknown, opts?: FetchOptions) =>
  fetcher<T>(path, { method: 'PUT', body: JSON.stringify(body), ...opts });

export const del = <T>(path: string, opts?: FetchOptions) =>
  fetcher<T>(path, { method: 'DELETE', ...opts });
