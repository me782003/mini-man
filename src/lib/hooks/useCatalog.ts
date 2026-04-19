import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { get } from '@/lib/fetcher';

export interface CatalogColor {
  id: number;
  hexa: string;
  image: string | null;
}

export interface CatalogVariantColor extends CatalogColor {
  variant_id: number;
  sku: string;
  price_modifier: string;
  stock: number;
  is_active: number;
  is_available: number;
}

export interface CatalogVariant {
  id: number;
  name: string;
  colors: CatalogVariantColor[];
}

export interface CatalogImage {
  id: number;
  image_path: string;
  is_primary: number;
  sort_order: number;
}

export interface CatalogProduct {
  id: number;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  price: string;
  stock: number;
  is_active: number;
  is_available: number;
  image_url: string;
  is_in_favourite: boolean;
  favourite_id: number | null;
  is_in_cart: boolean;
  cart_item_id: number | null;
  cart_item_quantity: number;
  category_collection: {
    collection: { id: number; name: string };
    category: { id: number; name: string };
  };
  sub_category: { id: number; name: string };
  images: CatalogImage[];
  colors: CatalogColor[];
  variants: CatalogVariant[];
}

export interface CatalogResponse {
  data: CatalogProduct[];
  message: string;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface CatalogQuery {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number;
  sub_category_id?: number;
  collection_id?: number;
  size_name?: string;
  min_price?: number;
  max_price?: number;
  is_available?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface CatalogSubCategory {
  id: number;
  name: string;
  products_count: number;
}

export interface CatalogCategory {
  id: number;
  name: string;
  products_count: number;
  sub_categories: CatalogSubCategory[];
}

export interface CatalogCollection {
  id: number;
  name: string;
  products_count: number;
}

export interface CatalogAvailability {
  in_stock: number;
  out_of_stock: number;
}

export interface CatalogPriceRange {
  min: number;
  max: number;
}

export interface CatalogFiltersResponse {
  data: {
    sizes: string[];
    collections: CatalogCollection[];
    categories: CatalogCategory[];
    availability: CatalogAvailability;
    price_range: CatalogPriceRange;
  };
  message: string;
}

function buildUrl(query: CatalogQuery): string {
  const params = new URLSearchParams();
  if (query.page)            params.set('page', String(query.page));
  if (query.per_page)        params.set('per_page', String(query.per_page));
  if (query.search)          params.set('search', query.search);
  if (query.category_id)     params.set('category_id', String(query.category_id));
  if (query.sub_category_id) params.set('sub_category_id', String(query.sub_category_id));
  if (query.collection_id)   params.set('collection_id', String(query.collection_id));
  if (query.size_name)       params.set('size_name', query.size_name);
  if (query.min_price != null) params.set('min_price', String(query.min_price));
  if (query.max_price != null) params.set('max_price', String(query.max_price));
  if (query.is_available != null) params.set('is_available', String(query.is_available));
  if (query.sort_by)         params.set('sort_by', query.sort_by);
  if (query.sort_order)      params.set('sort_order', query.sort_order);
  const qs = params.toString();
  return `/user/catalog/products${qs ? `?${qs}` : ''}`;
}

export function useCatalogFilters() {
  return useQuery({
    queryKey: ['catalog-filters'],
    queryFn: () => get<CatalogFiltersResponse>('/user/catalog/filters'),
    staleTime: 5 * 60_000,
  });
}

export function useCatalogProducts(query: CatalogQuery = {}) {
  return useQuery({
    queryKey: ['catalog-products', query],
    queryFn: () => get<CatalogResponse>(buildUrl(query)),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
}

export function useCatalogProductsInfinite(query: Omit<CatalogQuery, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['catalog-products-infinite', query],
    queryFn: ({ pageParam = 1 }) =>
      get<CatalogResponse>(buildUrl({ ...query, page: pageParam as number })),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    staleTime: 60_000,
  });
}
