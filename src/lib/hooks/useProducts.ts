import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { get, post, del } from '@/lib/fetcher';
import type { Product, ProductDetailResponse } from '@/lib/types';

// ── Types ─────────────────────────────────────────────────────────────────

export interface ProductsQuery {
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

// ── Query keys ────────────────────────────────────────────────────────────

export const productKeys = {
  all:    ()                   => ['products'] as const,
  list:   (q: ProductsQuery)   => ['products', 'list', q] as const,
  detail: (id: string)         => ['products', 'detail', id] as const,
};

// ── Fetchers ──────────────────────────────────────────────────────────────

function fetchProducts(query: ProductsQuery): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.page)     params.set('page', String(query.page));
  if (query.limit)    params.set('limit', String(query.limit));
  if (query.search)   params.set('search', query.search);
  const qs = params.toString();
  return get<ProductsResponse>(`/api/products${qs ? `?${qs}` : ''}`);
}

function fetchProduct(id: string): Promise<Product> {
  return get<Product>(`/api/products/${id}`);
}

// ── Hooks ─────────────────────────────────────────────────────────────────

export function useProducts(query: ProductsQuery = {}) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn:  () => fetchProducts(query),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn:  () => fetchProduct(id),
    enabled:  !!id,
  });
}

function fetchProductDetail(id: string): Promise<ProductDetailResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return get<ProductDetailResponse>(`/user/catalog/products/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['products', 'detail-v2', id],
    queryFn: () => fetchProductDetail(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: string; colorIndex: number; size: number }) =>
      post('/api/cart', vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => post('/api/wishlist', { productId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => del(`/api/wishlist/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}
