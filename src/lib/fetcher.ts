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

export async function fetcher<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...authHeader, ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }

  // 204 No Content — return empty
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// Convenience helpers
export const get = <T>(path: string, opts?: FetchOptions) =>
  fetcher<T>(path, { method: 'GET', ...opts });

export const post = <T>(path: string, body: unknown, opts?: FetchOptions) =>
  fetcher<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts });

export const patch = <T>(path: string, body: unknown, opts?: FetchOptions) =>
  fetcher<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...opts });

export const del = <T>(path: string, opts?: FetchOptions) =>
  fetcher<T>(path, { method: 'DELETE', ...opts });
